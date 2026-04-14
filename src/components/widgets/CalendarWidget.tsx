'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './CalendarWidget.module.css';

export default function CalendarWidget() {
    const [date, setDate] = useState(new Date());

    const today = new Date();
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    const days = useMemo(() => {
        const result: (number | null)[] = [];
        // Pad start
        for (let i = 0; i < firstDayOfWeek; i++) result.push(null);
        for (let d = 1; d <= daysInMonth; d++) result.push(d);
        return result;
    }, [firstDayOfWeek, daysInMonth]);

    const isToday = (day: number) => {
        return day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
    };

    const prevMonth = () => setDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setDate(new Date(currentYear, currentMonth + 1, 1));
    const goToToday = () => setDate(new Date());

    const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div className={styles.widget}>
            <div className={styles.header}>
                <button className={styles.navBtn} onClick={prevMonth}>
                    <ChevronLeft size={14} />
                </button>
                <button className={styles.monthLabel} onClick={goToToday}>
                    {monthName}
                </button>
                <button className={styles.navBtn} onClick={nextMonth}>
                    <ChevronRight size={14} />
                </button>
            </div>

            <div className={styles.weekdays}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <span key={day} className={styles.weekday}>{day}</span>
                ))}
            </div>

            <div className={styles.grid}>
                {days.map((day, i) => (
                    <span
                        key={i}
                        className={`${styles.day} ${day === null ? styles.empty : ''} ${day && isToday(day) ? styles.today : ''}`}
                    >
                        {day}
                    </span>
                ))}
            </div>
        </div>
    );
}
