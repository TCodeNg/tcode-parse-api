const isWeekend = (date: Date): boolean => {
  return date.getDay() === 6 || date.getDay() === 0;
};

export const countBusinessDays = (startDate: Date, dueDays: number): Date => {
  let index = 0;
  let currentDate = startDate;
  const weekdays = [];

  while (index < dueDays) {
    if (!isWeekend(currentDate)) {
      weekdays.push(currentDate);
      index++;
    }
    currentDate = new Date(currentDate.valueOf() + 1000 * 60 * 60 * 24);
  }

  return weekdays[weekdays.length - 1];
};