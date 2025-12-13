import NMonday from './Not/NMonday.png';
import NTuesday from './Not/NTuesday.png';
import NWednesday from './Not/NWednesday.png';
import NThursday from './Not/NThursday.png';
import NFriday from './Not/NFriday.png';
import NSatSun from './Not/NSat_Sun.png';
import Monday from './Today/Monday.png';
import Tuesday from './Today/Tuesday.png';
import Wednesday from './Today/Wednesday.png';
import Thursday from './Today/Thursday.png';
import Friday from './Today/Friday.png';
import SatSun from './Today/Sat_Sun.png';

import styles from './Day.module.css'

export default function Day() {
    const notToday = {
        Monday: NMonday,
        Tuesday: NTuesday,
        Wednesday: NWednesday,
        Thursday: NThursday,
        Friday: NFriday,
        Saturday: NSatSun,
        Sunday: NSatSun
    };

    const isToday = {
        Monday: Monday,
        Tuesday: Tuesday,
        Wednesday: Wednesday,
        Thursday: Thursday,
        Friday: Friday,
        Saturday: SatSun,
        Sunday: SatSun
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const dateToday = new Date().getDay();
    const today = days[dateToday];

    return (
        <div className={styles.dayGrid}>
            {days.map((day) => (
                day === today ? (<img key={day} src={isToday[day]} alt={day}/>) :
                    (<img key={day} src={notToday[day]} alt={day}/>)
            ))}
        </div>
    );
}