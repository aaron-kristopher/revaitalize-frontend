interface ScheduleDetail {
	allowedDays: number[];
	lastDay: number;
	displayName: string;
}


export const SCHEDULE_CONFIG: Record<number, ScheduleDetail> = {
	2: { allowedDays: [2, 4], lastDay: 4, displayName: "Tuesday & Thrusday", },
	3: { allowedDays: [1, 3, 5], lastDay: 5, displayName: "Monday, Wednesday, Friday", },
	5: { allowedDays: [1, 2, 3, 4, 5], lastDay: 5, displayName: "Weekdays", },
	7: { allowedDays: [0, 1, 2, 3, 4, 5, 6], lastDay: 6, displayName: "Everyday", },
}
