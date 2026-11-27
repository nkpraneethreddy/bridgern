import { useStreakStore } from '../src/stores/streakStore';

describe('streakStore', () => {
  beforeEach(() => {
    useStreakStore.setState({
      currentStreak: 0,
      longestStreak: 0,
      lastPracticeDate: null,
      totalDaysPracticed: 0,
      milestoneReached: null,
    });
  });

  it('records first practice day and starts streak at 1', () => {
    useStreakStore.getState().recordPracticeDay();
    const s = useStreakStore.getState();
    expect(s.currentStreak).toBe(1);
    expect(s.longestStreak).toBe(1);
    expect(s.totalDaysPracticed).toBe(1);
    expect(s.lastPracticeDate).toBeTruthy();
  });

  it('does not double-count if called twice on the same day', () => {
    useStreakStore.getState().recordPracticeDay();
    useStreakStore.getState().recordPracticeDay();
    const s = useStreakStore.getState();
    expect(s.currentStreak).toBe(1);
    expect(s.totalDaysPracticed).toBe(1);
  });

  it('extends streak on consecutive days', () => {
    // Simulate 3 consecutive days
    const yesterday2 = new Date();
    yesterday2.setDate(yesterday2.getDate() - 2);
    const yesterday1 = new Date();
    yesterday1.setDate(yesterday1.getDate() - 1);
    const today = new Date();

    useStreakStore.setState({ lastPracticeDate: yesterday2.toISOString().split('T')[0], currentStreak: 1, longestStreak: 1, totalDaysPracticed: 1, milestoneReached: null });
    useStreakStore.setState({ lastPracticeDate: yesterday1.toISOString().split('T')[0], currentStreak: 2, longestStreak: 2, totalDaysPracticed: 2, milestoneReached: null });
    useStreakStore.getState().recordPracticeDay();

    const s = useStreakStore.getState();
    expect(s.currentStreak).toBe(3);
    expect(s.longestStreak).toBe(3);
  });

  it('resets streak to 1 when a day is missed', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    useStreakStore.setState({
      lastPracticeDate: twoDaysAgo.toISOString().split('T')[0],
      currentStreak: 10,
      longestStreak: 10,
      totalDaysPracticed: 10,
      milestoneReached: null,
    });

    useStreakStore.getState().recordPracticeDay();
    const s = useStreakStore.getState();
    expect(s.currentStreak).toBe(1);
    expect(s.longestStreak).toBe(10); // Longest preserved
  });

  it('fires milestone at streak of 3', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    useStreakStore.setState({ lastPracticeDate: yesterday.toISOString().split('T')[0], currentStreak: 2, longestStreak: 2, totalDaysPracticed: 2, milestoneReached: null });
    useStreakStore.getState().recordPracticeDay();

    expect(useStreakStore.getState().milestoneReached).toBe(3);
  });

  it('dismissMilestone clears the milestone flag', () => {
    useStreakStore.setState({ milestoneReached: 7 });
    useStreakStore.getState().dismissMilestone();
    expect(useStreakStore.getState().milestoneReached).toBeNull();
  });

  it('resetStreak zeroes all state', () => {
    useStreakStore.setState({ currentStreak: 14, longestStreak: 30, totalDaysPracticed: 50 });
    useStreakStore.getState().resetStreak();
    const s = useStreakStore.getState();
    expect(s.currentStreak).toBe(0);
    expect(s.longestStreak).toBe(0);
    expect(s.totalDaysPracticed).toBe(0);
  });
});
