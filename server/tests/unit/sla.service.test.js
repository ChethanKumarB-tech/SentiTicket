const { calculateDeadline, evaluateSlaState } = require('../../src/services/sla.service');

describe('SLA Engine & State Machine Mathematics', () => {
  describe('calculateDeadline()', () => {
    it('should accurately calculate continuous 24/7 deadlines when businessHoursOnly is false', () => {
      const start = new Date('2026-08-14T10:00:00.000Z');
      const targetMinutes = 120;

      const deadline = calculateDeadline(start, targetMinutes, null, false);
      expect(deadline.toISOString()).toEqual('2026-08-14T12:00:00.000Z');
    });

    it('should skip overnight hours when businessHoursOnly is true', () => {
      const start = new Date('2026-08-14T17:00:00.000Z');
      const businessHours = { start: '09:00', end: '18:00', workDays: [1, 2, 3, 4, 5] };

      const deadline = calculateDeadline(start, 120, businessHours, true);
      expect(deadline.getUTCDay()).toBe(1);
      expect(deadline.getUTCHours()).toBe(10);
      expect(deadline.getUTCMinutes()).toBe(0);
    });
  });

  describe('evaluateSlaState()', () => {
    it('should return SAFE when elapsed time is below 50% threshold', () => {
      const now = new Date('2026-08-14T10:10:00.000Z');
      const ticket = {
        status: 'OPEN',
        createdAt: new Date('2026-08-14T10:00:00.000Z'),
        slaResolutionDeadline: new Date('2026-08-14T12:00:00.000Z'),
        slaState: 'SAFE'
      };

      const state = evaluateSlaState(ticket, now);
      expect(state).toBe('SAFE');
    });

    it('should transition to AT_RISK when elapsed time reaches 50%', () => {
      const now = new Date('2026-08-14T11:05:00.000Z');
      const ticket = {
        status: 'OPEN',
        createdAt: new Date('2026-08-14T10:00:00.000Z'),
        slaResolutionDeadline: new Date('2026-08-14T12:00:00.000Z'),
        slaState: 'SAFE'
      };

      const state = evaluateSlaState(ticket, now);
      expect(state).toBe('AT_RISK');
    });

    it('should transition to CRITICAL when elapsed time reaches 80%', () => {
      const now = new Date('2026-08-14T11:40:00.000Z');
      const ticket = {
        status: 'OPEN',
        createdAt: new Date('2026-08-14T10:00:00.000Z'),
        slaResolutionDeadline: new Date('2026-08-14T12:00:00.000Z'),
        slaState: 'AT_RISK'
      };

      const state = evaluateSlaState(ticket, now);
      expect(state).toBe('CRITICAL');
    });

    it('should transition to BREACHED when current time passes deadline', () => {
      const now = new Date('2026-08-14T12:05:00.000Z');
      const ticket = {
        status: 'OPEN',
        createdAt: new Date('2026-08-14T10:00:00.000Z'),
        slaResolutionDeadline: new Date('2026-08-14T12:00:00.000Z'),
        slaState: 'CRITICAL'
      };

      const state = evaluateSlaState(ticket, now);
      expect(state).toBe('BREACHED');
    });
  });
});
