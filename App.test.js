import { isSameDay } from './App';

test('isSameDay should return true for same date', () => {
    const date1 = new Date(2024, 0, 1);
    const date2 = new Date(2024, 0, 1);
    expect(isSameDay(date1, date2)).toBe(true);
});

test('isSameDay should return false for different dates', () => {
    const date1 = new Date(2024, 0, 1);
    const date2 = new Date(2024, 0, 2);
    expect(isSameDay(date1, date2)).toBe(false);
});