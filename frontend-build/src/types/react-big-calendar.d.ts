declare module 'react-big-calendar' {
  import { ComponentType } from 'react';

  export interface Event {
    id?: string | number;
    title: string;
    start: Date;
    end: Date;
    resource?: any;
  }

  export interface SlotInfo {
    start: Date;
    end: Date;
    slots: Date[];
  }

  export interface CalendarProps {
    localizer: any;
    events: Event[];
    startAccessor: string | ((event: Event) => Date);
    endAccessor: string | ((event: Event) => Date);
    titleAccessor?: string | ((event: Event) => string);
    allDayAccessor?: string | ((event: Event) => boolean);
    tooltipAccessor?: string | ((event: Event) => string);
    view?: string;
    views?: any;
    messages?: any;
    culture?: string;
    components?: any;
    formats?: any;
    style?: React.CSSProperties;
    className?: string;
    elementProps?: any;
    date?: Date;
    length?: number;
    toolbar?: boolean;
    popup?: boolean;
    popupOffset?: number | { x: number; y: number };
    selectable?: boolean | 'ignoreEvents';
    longPressThreshold?: number;
    onNavigate?: (newDate: Date, view: string, action: string) => void;
    onView?: (view: string) => void;
    onDrillDown?: (date: Date, view: string) => void;
    onSelectSlot?: (slotInfo: SlotInfo) => void;
    onSelectEvent?: (event: Event) => void;
    onDoubleClickEvent?: (event: Event) => void;
    onKeyPressEvent?: (event: Event) => void;
    onSelecting?: (range: { start: Date; end: Date }) => boolean | undefined | null;
    onRangeChange?: (range: Date[] | { start: Date; end: Date }, view?: string) => void;
    onShowMore?: (events: Event[], date: Date) => void;
    onSelecting?: (range: { start: Date; end: Date }) => boolean | undefined | null;
    eventPropGetter?: (event: Event, start: Date, end: Date, isSelected: boolean) => { style?: React.CSSProperties; className?: string };
    slotPropGetter?: (date: Date) => { style?: React.CSSProperties; className?: string };
    dayPropGetter?: (date: Date) => { style?: React.CSSProperties; className?: string };
    showMultiDayTimes?: boolean;
    step?: number;
    timeslots?: number;
    rtl?: boolean;
    eventOverlap?: any;
    min?: Date;
    max?: Date;
    scrollToTime?: Date;
    enableAutoScroll?: boolean;
    onSelecting?: (range: { start: Date; end: Date }) => boolean | undefined | null;
  }

  export const Calendar: ComponentType<CalendarProps>;
  export const dateFnsLocalizer: (config: any) => any;
  export const momentLocalizer: (moment: any) => any;
  export const globalizeLocalizer: (globalize: any) => any;
  export const luxonLocalizer: (luxon: any) => any;
  export const dayjsLocalizer: (dayjs: any) => any;
} 