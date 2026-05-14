/**
 * localStorage 存储管理模块
 * 负责刷题记录、错题、统计数据、进度的持久化存储
 */
const Storage = {
  // 获取对应模式的错题列表
  getWrongList(mode) {
    const raw = localStorage.getItem('bio_exam_wrong_' + mode);
    return raw ? JSON.parse(raw) : [];
  },

  // 添加一个错题ID
  addWrong(mode, qid) {
    const list = this.getWrongList(mode);
    if (!list.includes(qid)) {
      list.push(qid);
      localStorage.setItem('bio_exam_wrong_' + mode, JSON.stringify(list));
    }
  },

  // 移除一个错题ID（答对时）
  removeWrong(mode, qid) {
    const list = this.getWrongList(mode);
    const idx = list.indexOf(qid);
    if (idx !== -1) {
      list.splice(idx, 1);
      localStorage.setItem('bio_exam_wrong_' + mode, JSON.stringify(list));
    }
  },

  // 清空某模式错题
  clearWrong(mode) {
    localStorage.setItem('bio_exam_wrong_' + mode, JSON.stringify([]));
  },

  // 获取统计
  getStats(mode) {
    const raw = localStorage.getItem('bio_exam_stats_' + mode);
    return raw ? JSON.parse(raw) : { total: 0, correct: 0 };
  },

  // 更新统计（传入 isCorrect: boolean）
  updateStats(mode, isCorrect) {
    const stats = this.getStats(mode);
    stats.total += 1;
    if (isCorrect) stats.correct += 1;
    localStorage.setItem('bio_exam_stats_' + mode, JSON.stringify(stats));
  },

  // 重置某模式统计
  resetStats(mode) {
    localStorage.setItem('bio_exam_stats_' + mode, JSON.stringify({ total: 0, correct: 0 }));
  },

  // 保存当前进度
  saveProgress(mode, index) {
    localStorage.setItem('bio_exam_progress_' + mode, index);
  },

  // 读取当前进度
  getProgress(mode) {
    return parseInt(localStorage.getItem('bio_exam_progress_' + mode)) || 0;
  },

  // 获取已计数的题目ID集合（防跨会话重复统计）
  getCountedSet(mode) {
    const raw = localStorage.getItem('bio_exam_counted_' + mode);
    return raw ? JSON.parse(raw) : [];
  },

  // 标记题目已计入统计
  markCounted(mode, qid) {
    const set = this.getCountedSet(mode);
    if (set.indexOf(qid) === -1) {
      set.push(qid);
      localStorage.setItem('bio_exam_counted_' + mode, JSON.stringify(set));
      return true; // 首次计数
    }
    return false; // 已计数过
  },

  // 重置已计数记录（随统计一起重置）
  clearCounted(mode) {
    localStorage.removeItem('bio_exam_counted_' + mode);
  }
};
