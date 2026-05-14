/**
 * 生物合格考刷题小程序 —— 主应用逻辑
 */
(function () {
  'use strict';

  // ---- DOM 元素引用 ----
  const $ = function (sel) { return document.querySelector(sel); };
  const $$ = function (sel) { return document.querySelectorAll(sel); };

  const screenHome    = $('#screen-home');
  const screenQuiz    = $('#screen-quiz');
  const screenStats   = $('#screen-stats');

  // 首页按钮
  const btnBixiu1   = $('#btn-bixiu1');
  const btnBixiu2   = $('#btn-bixiu2');
  const btnMixed    = $('#btn-mixed');
  const btnStatsNav = $('#btn-stats-nav');

  // 答题界面
  const quizTitle   = $('#quiz-title');
  const quizIndex   = $('#quiz-index');
  const quizTotal   = $('#quiz-total');
  const quizQuestion= $('#quiz-question');
  const quizOptions = $('#quiz-options');
  const quizFeedback= $('#quiz-feedback');
  const quizExplanation = $('#quiz-explanation');
  const btnPrev     = $('#btn-prev');
  const btnNext     = $('#btn-next');
  const btnBackHome = $('#btn-back-home');
  const progressFill= $('#progress-fill');

  // 统计界面
  const statsModeTitle = $('#stats-mode-title');
  const btnStatsB1  = $('#btn-stats-b1');
  const btnStatsB2  = $('#btn-stats-b2');
  const btnStatsMixed = $('#btn-stats-mixed');
  const statTotal   = $('#stat-total');
  const statCorrect = $('#stat-correct');
  const statAccuracy= $('#stat-accuracy');
  const wrongListEl = $('#wrong-list');
  const btnReviewWrong = $('#btn-review-wrong');
  const btnClearWrong  = $('#btn-clear-wrong');
  const btnClearStats  = $('#btn-clear-stats');
  const btnBackHome2  = $('#btn-back-home-2');

  // ---- 状态变量 ----
  var currentMode = null;      // 'bixiu1' | 'bixiu2' | 'mixed'
  var questions  = [];         // 当前题目列表
  var currentIdx = 0;          // 当前题目索引
  var answered   = {};         // { idx: true/false } 是否已答对
  var selectedOption = null;   // 当前选中的选项索引
  var isFeedbackShown = false; // 是否已显示反馈

  // ---- 工具函数 ----
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  // 将刷题模式转为 Storage 存储模式（错题模式 → 基础模式）
  function toStorageMode(mode) {
    if (mode === 'wrong_bixiu1') return 'bixiu1';
    if (mode === 'wrong_bixiu2') return 'bixiu2';
    if (mode === 'wrong_mixed') return 'mixed';
    return mode;
  }

  // ---- 题库获取 ----
  function getQuestions(mode) {
    if (mode === 'bixiu1')  return QUESTIONS_BIXIU1.slice();
    if (mode === 'bixiu2')  return QUESTIONS_BIXIU2.slice();
    if (mode === 'mixed')   return shuffle(QUESTIONS_BIXIU1.concat(QUESTIONS_BIXIU2));
    if (mode === 'wrong_bixiu1' || mode === 'wrong_bixiu2' || mode === 'wrong_mixed') {
      var baseMode = mode.replace('wrong_', '');
      var fullList = baseMode === 'bixiu1' ? QUESTIONS_BIXIU1
                   : baseMode === 'bixiu2' ? QUESTIONS_BIXIU2
                   : QUESTIONS_BIXIU1.concat(QUESTIONS_BIXIU2);
      var wrongIds = Storage.getWrongList(baseMode);
      return fullList.filter(function (q) { return wrongIds.indexOf(q.id) !== -1; });
    }
    return [];
  }

  // ---- 屏幕切换 ----
  function showScreen(screen) {
    screenHome.classList.add('hidden');
    screenQuiz.classList.add('hidden');
    screenStats.classList.add('hidden');
    screen.classList.remove('hidden');
  }

  // ---- 首页 ----
  function goHome() {
    showScreen(screenHome);
  }

  // ---- 开始刷题 ----
  function startQuiz(mode) {
    currentMode = mode;
    questions = getQuestions(mode);
    if (questions.length === 0) {
      alert('该模式下暂无题目，请先在其他模式中产生错题后再来回顾！');
      return;
    }
    answered = {};
    selectedOption = null;
    isFeedbackShown = false;
    currentIdx = Storage.getProgress(mode);
    if (currentIdx >= questions.length) currentIdx = 0;

    showScreen(screenQuiz);
    updateQuizTitle(mode);
    renderQuestion();
  }

  function updateQuizTitle(mode) {
    var titles = {
      bixiu1: '必修一 专项刷题',
      bixiu2: '必修二 专项刷题',
      mixed: '必修一+必修二 混合刷题',
      wrong_bixiu1: '必修一 错题回顾',
      wrong_bixiu2: '必修二 错题回顾',
      wrong_mixed: '混合模式 错题回顾'
    };
    quizTitle.textContent = titles[mode] || '刷题模式';
    quizTotal.textContent = questions.length;
  }

  // ---- 题目渲染 ----
  function renderQuestion() {
    var q = questions[currentIdx];
    quizIndex.textContent = currentIdx + 1;
    quizQuestion.textContent = (currentIdx + 1) + '. ' + q.question;

    // 渲染选项
    quizOptions.innerHTML = '';
    q.options.forEach(function (opt, i) {
      var btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt;
      btn.addEventListener('click', function () { selectAnswer(i); });
      quizOptions.appendChild(btn);
    });

    // 重置反馈区
    quizFeedback.textContent = '';
    quizFeedback.className = 'feedback';
    quizFeedback.style.display = 'none';
    quizExplanation.textContent = '';
    quizExplanation.style.display = 'none';
    isFeedbackShown = false;

    // 更新进度条
    var pct = ((currentIdx + 1) / questions.length) * 100;
    progressFill.style.width = pct + '%';

    // 按钮状态
    updateNavButtons();

    // 保存进度
    Storage.saveProgress(currentMode, currentIdx);
  }

  function updateNavButtons() {
    btnPrev.disabled = (currentIdx === 0);
    btnNext.disabled = (currentIdx >= questions.length - 1);
  }

  // ---- 选择答案 ----
  function selectAnswer(idx) {
    if (isFeedbackShown) return; // 已作答，不允许重复选择

    selectedOption = idx;
    isFeedbackShown = true;
    var q = questions[currentIdx];
    var isCorrect = (idx === q.answer);

    // 高亮用户选择
    var optionBtns = quizOptions.querySelectorAll('.option-btn');
    optionBtns.forEach(function (btn, i) {
      btn.classList.add('disabled');
      if (i === q.answer) btn.classList.add('correct');
      if (i === idx && !isCorrect) btn.classList.add('wrong');
    });

    // 显示反馈
    if (isCorrect) {
      quizFeedback.textContent = '✓ 回答正确！';
      quizFeedback.className = 'feedback feedback-correct';
    } else {
      quizFeedback.textContent = '✗ 回答错误！正确答案是 ' + q.options[q.answer];
      quizFeedback.className = 'feedback feedback-wrong';
    }

    // 显示解析
    quizFeedback.style.display = 'block';
    quizExplanation.textContent = '💡 解析：' + (q.explanation || '暂无解析');
    quizExplanation.style.display = 'block';

    // 更新储存
    var storageMode = toStorageMode(currentMode);
    // 跨会话持久化防重复：仅在首次作答时计入统计
    if (Storage.markCounted(storageMode, q.id)) {
      Storage.updateStats(storageMode, isCorrect);
    }
    if (isCorrect) {
      Storage.removeWrong(storageMode, q.id);
    } else {
      Storage.addWrong(storageMode, q.id);
    }
    answered[currentIdx] = isCorrect;
  }

  // ---- 导航 ----
  function goNext() {
    if (currentIdx < questions.length - 1) {
      currentIdx++;
      selectedOption = null;
      isFeedbackShown = false;
      renderQuestion();
    }
  }

  function goPrev() {
    if (currentIdx > 0) {
      currentIdx--;
      selectedOption = null;
      isFeedbackShown = false;
      renderQuestion();
    }
  }

  // ---- 统计界面 ----
  var statsCurrentMode = 'bixiu1';
  function showStats(mode) {
    statsCurrentMode = mode || 'bixiu1';
    showScreen(screenStats);
    renderStats();
    updateStatsTab();
  }

  function updateStatsTab() {
    btnStatsB1.classList.remove('active');
    btnStatsB2.classList.remove('active');
    btnStatsMixed.classList.remove('active');
    if (statsCurrentMode === 'bixiu1') btnStatsB1.classList.add('active');
    if (statsCurrentMode === 'bixiu2') btnStatsB2.classList.add('active');
    if (statsCurrentMode === 'mixed') btnStatsMixed.classList.add('active');

    var titles = { bixiu1: '必修一', bixiu2: '必修二', mixed: '必修一+必修二混合' };
    statsModeTitle.textContent = titles[statsCurrentMode] || '';
  }

  function renderStats() {
    var stats = Storage.getStats(statsCurrentMode);
    statTotal.textContent = stats.total;
    statCorrect.textContent = stats.correct;
    if (stats.total > 0) {
      statAccuracy.textContent = Math.round((stats.correct / stats.total) * 100) + '%';
    } else {
      statAccuracy.textContent = '--';
    }

    // 错题列表
    var wrongIds = Storage.getWrongList(statsCurrentMode);
    var allQuestions = statsCurrentMode === 'bixiu1' ? QUESTIONS_BIXIU1
                     : statsCurrentMode === 'bixiu2' ? QUESTIONS_BIXIU2
                     : QUESTIONS_BIXIU1.concat(QUESTIONS_BIXIU2);

    wrongListEl.innerHTML = '';
    if (wrongIds.length === 0) {
      wrongListEl.innerHTML = '<p class="empty-hint">暂无错题，继续保持！</p>';
      btnReviewWrong.disabled = true;
      btnClearWrong.disabled = true;
    } else {
      btnReviewWrong.disabled = false;
      btnClearWrong.disabled = false;
      wrongIds.forEach(function (id) {
        var q = allQuestions.find(function (item) { return item.id === id; });
        if (!q) return;
        var div = document.createElement('div');
        div.className = 'wrong-item';
        div.innerHTML = '<span class="wrong-q">' + q.question + '</span>'
                      + '<span class="wrong-a">答案：' + q.options[q.answer] + '</span>';
        wrongListEl.appendChild(div);
      });
    }
  }

  // ---- 事件绑定 ----
  // 首页
  btnBixiu1.addEventListener('click', function () { startQuiz('bixiu1'); });
  btnBixiu2.addEventListener('click', function () { startQuiz('bixiu2'); });
  btnMixed.addEventListener('click',  function () { startQuiz('mixed'); });
  btnStatsNav.addEventListener('click', function () { showStats('bixiu1'); });

  // 答题
  btnPrev.addEventListener('click', goPrev);
  btnNext.addEventListener('click', goNext);
  btnBackHome.addEventListener('click', function () {
    if (confirm('确定要返回首页吗？当前进度已保存。')) {
      goHome();
    }
  });

  // 键盘事件
  document.addEventListener('keydown', function (e) {
    if (screenQuiz.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
    if (!isFeedbackShown) {
      var keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
      if (keyMap[e.key.toLowerCase()] !== undefined) {
        selectAnswer(keyMap[e.key.toLowerCase()]);
      }
    }
  });

  // 统计页
  btnStatsB1.addEventListener('click', function () {
    statsCurrentMode = 'bixiu1';
    renderStats();
    updateStatsTab();
  });
  btnStatsB2.addEventListener('click', function () {
    statsCurrentMode = 'bixiu2';
    renderStats();
    updateStatsTab();
  });
  btnStatsMixed.addEventListener('click', function () {
    statsCurrentMode = 'mixed';
    renderStats();
    updateStatsTab();
  });
  btnReviewWrong.addEventListener('click', function () {
    var modeMap = { bixiu1: 'wrong_bixiu1', bixiu2: 'wrong_bixiu2', mixed: 'wrong_mixed' };
    startQuiz(modeMap[statsCurrentMode]);
  });
  btnClearWrong.addEventListener('click', function () {
    if (confirm('确定清空"' + statsModeTitle.textContent + '"模式下的所有错题吗？')) {
      Storage.clearWrong(statsCurrentMode);
      renderStats();
    }
  });
  btnClearStats.addEventListener('click', function () {
    if (confirm('确定重置"' + statsModeTitle.textContent + '"模式下的答题统计吗？（错题数据保留）')) {
      Storage.resetStats(statsCurrentMode);
      Storage.clearCounted(statsCurrentMode);
      renderStats();
    }
  });
  btnBackHome2.addEventListener('click', goHome);

  // ---- 初始状态 ----
  goHome();
})();
