'use client'
import orderBy from "lodash-es/orderBy";
import { useEffect, useState } from "react";

const languages = {
    ru: "Русский",
    en: "English",
    sr_cy: "Српски",
    sr_lat: "Srpski",
};

interface OrderToNameMap {
    order: number;
    name: string;
}

export default function CalendarPage(): React.ReactElement {
    const [language, setLanguage] = useState<string>("ru");

    const [title, setTitle] = useState<string>("");
    const [months, setMonths] = useState<OrderToNameMap[]>([]);
    const [weekdays, setWeekdays] = useState<OrderToNameMap[]>([]);

    const getPreTitle = () => {
        switch (language) {
            case "ru":
                return "ёбнутый";
            case "en":
                return "batshit";
            case "sr_cy":
                return "блентав";
            case "sr_lat":
                return "blentav";
            default:
                return "";
        }
    }

    const renderTitle = () => {
        const preTitle = orderBy(getPreTitle(), x => x, "asc").join("");
        switch (language) {
            case "ru":
                return preTitle + " календарь";
            case "en":
                return preTitle + " calendar";
            case "sr_cy":
                return preTitle + " календар";
            case "sr_lat":
                return preTitle + " kalendar";
            default:
                return "";
        }
    }

    useEffect(() => {
        switch (language) {
            case "ru":
                setMonths([
                    {order: 1, name: "Январь"},
                    {order: 2, name: "Февраль"},
                    {order: 3, name: "Март"},
                    {order: 4, name: "Апрель"},
                    {order: 5, name: "Май"},
                    {order: 6, name: "Июнь"},
                    {order: 7, name: "Июль"},
                    {order: 8, name: "Август"},
                    {order: 9, name: "Сентябрь"},
                    {order: 10, name: "Октябрь"},
                    {order: 11, name: "Ноябрь"},
                    {order: 12, name: "Декабрь"}
                ]);
                break;
            case "en":
                setMonths([
                    {order: 1, name: "January"},
                    {order: 2, name: "February"},
                    {order: 3, name: "March"},
                    {order: 4, name: "April"},
                    {order: 5, name: "May"},
                    {order: 6, name: "June"},
                    {order: 7, name: "July"},
                    {order: 8, name: "August"},
                    {order: 9, name: "September"},
                    {order: 10, name: "October"},
                    {order: 11, name: "November"},
                    {order: 12, name: "December"}
                ]);
                break;
            case "sr_cy":
                setMonths([
                    {order: 1, name: "Јануар"},
                    {order: 2, name: "Фебруар"},
                    {order: 3, name: "Март"},
                    {order: 4, name: "Април"},
                    {order: 5, name: "Мај"},
                    {order: 6, name: "Јун"},
                    {order: 7, name: "Јул"},
                    {order: 8, name: "Август"},
                    {order: 9, name: "Септембар"},
                    {order: 10, name: "Октобар"},
                    {order: 11, name: "Новембар"},
                    {order: 12, name: "Децембар"}
                ]);
                break;
            case "sr_lat":
                setMonths([
                    {order: 1, name: "Januar"},
                    {order: 2, name: "Februar"},
                    {order: 3, name: "Mart"},
                    {order: 4, name: "April"},
                    {order: 5, name: "Maj"},
                    {order: 6, name: "Jun"},
                    {order: 7, name: "Jul"},
                    {order: 8, name: "Avgust"},
                    {order: 9, name: "Septembar"},
                    {order: 10, name: "Oktobar"},
                    {order: 11, name: "Novembar"},
                    {order: 12, name: "Decembar"}
                ]);
                break;
            default:
                setMonths([]);
        }
    }, [language]);

    useEffect(() => {
        switch (language) {
            case "ru":
                setWeekdays([
                    {order: 1, name: "Понедельник"},
                    {order: 2, name: "Вторник"},
                    {order: 3, name: "Среда"},
                    {order: 4, name: "Четверг"},
                    {order: 5, name: "Пятница"},
                    {order: 6, name: "Суббота"},
                    {order: 7, name: "Воскресенье"}
                ]);
                break;
            case "en":
                setWeekdays([
                    {order: 1, name: "Monday"},
                    {order: 2, name: "Tuesday"},
                    {order: 3, name: "Wednesday"},
                    {order: 4, name: "Thursday"},
                    {order: 5, name: "Friday"},
                    {order: 6, name: "Saturday"},
                    {order: 7, name: "Sunday"}
                ]);
                break;
            case "sr_cy":
                setWeekdays([
                    {order: 1, name: "Понедељак"},
                    {order: 2, name: "Уторак"},
                    {order: 3, name: "Среда"},
                    {order: 4, name: "Четвртак"},
                    {order: 5, name: "Петак"},
                    {order: 6, name: "Субота"},
                    {order: 7, name: "Недеља"}
                ]);
                break;
            case "sr_lat":
                setWeekdays([
                    {order: 1, name: "Ponedeljak"},
                    {order: 2, name: "Utorak"},
                    {order: 3, name: "Sreda"},
                    {order: 4, name: "Četvrtak"},
                    {order: 5, name: "Petak"},
                    {order: 6, name: "Subota"},
                    {order: 7, name: "Nedelja"}
                ]);
                break;
            default:
                setWeekdays([]);
        }
    }, [language]);
    
    return (
        <div>
            <div>
                <ul>
                    {Object.keys(languages).map((lang) => (
                        <li key={lang}>
                            <button onClick={() => setLanguage(lang)}>
                                {languages[lang as keyof typeof languages]}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2>{renderTitle()}</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {orderBy(months, (m: OrderToNameMap) => m.name).map(month => (
                    <div key={month.order}>
                        <h3 className="text-lg font-bold">{month.name}</h3>
                        <div>
                            <ul>
                                {orderBy(weekdays, (w: OrderToNameMap) => w.name).map(weekday => (
                                    <li key={weekday.order}>{weekday.name}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
    )
}