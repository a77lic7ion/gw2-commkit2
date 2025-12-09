
import React, { useState, useMemo, useCallback, useEffect, useRef, Dispatch, SetStateAction, useContext } from 'react';
import { createRoot } from 'react-dom/client';

// --- TYPE DEFINITIONS for Static Data ---
// This strict typing is a permanent fix to prevent recurring TypeScript errors.
type Segment = { readonly name: string; readonly chatlink?: string; };
type SequenceItem = { readonly r: number; readonly d: number; };
type EventTimerInfo = {
    readonly category: string;
    readonly name: string;
    readonly segments: { readonly [key: string]: Segment };
    readonly sequences: {
        readonly partial: readonly SequenceItem[];
        readonly pattern: readonly SequenceItem[];
    };
};

// --- STATIC TIMER DATA ---
// Data is now complete with all waypoints and strictly typed using 'as const'.
const GW2_NINJA_TIMER_DATA = {
    "events": {
        "wb": { "category": "Core Tyria", "name": "World bosses", "segments": { "1": { "name": "Admiral Taidha Covington", "chatlink": "[&BKgBAAA=]" }, "2": { "name": "Claw of Jormag", "chatlink": "[&BHoCAAA=]" }, "3": { "name": "Fire Elemental", "chatlink": "[&BEcAAAA=]" }, "4": { "name": "Golem Mark II", "chatlink": "[&BNQCAAA=]" }, "5": { "name": "Great Jungle Wurm", "chatlink": "[&BEEFAAA=]" }, "6": { "name": "Megadestroyer", "chatlink": "[&BM0CAAA=]" }, "7": { "name": "Modniir Ulgoth", "chatlink": "[&BLAAAAA=]" }, "8": { "name": "Shadow Behemoth", "chatlink": "[&BPcAAAA=]" }, "9": { "name": "Svanir Shaman Chief", "chatlink": "[&BMIDAAA=]" }, "10": { "name": "The Shatterer", "chatlink": "[&BE4DAAA=]" } }, "sequences": { "partial": [], "pattern": [{ "r": 1, "d": 15 }, { "r": 9, "d": 15 }, { "r": 6, "d": 15 }, { "r": 3, "d": 15 }, { "r": 10, "d": 15 }, { "r": 5, "d": 15 }, { "r": 7, "d": 15 }, { "r": 8, "d": 15 }, { "r": 4, "d": 15 }, { "r": 9, "d": 15 }, { "r": 2, "d": 15 }, { "r": 3, "d": 15 }, { "r": 1, "d": 15 }, { "r": 5, "d": 15 }, { "r": 6, "d": 15 }, { "r": 8, "d": 15 }, { "r": 10, "d": 15 }, { "r": 9, "d": 15 }, { "r": 7, "d": 15 }, { "r": 3, "d": 15 }, { "r": 4, "d": 15 }, { "r": 5, "d": 15 }, { "r": 2, "d": 15 }, { "r": 8, "d": 15 }] } },
        "hwb": { "category": "Core Tyria", "name": "Hard world bosses", "segments": { "0": { "name": "" }, "1": { "name": "Triple Trouble", "chatlink": "[&BKoBAAA=]" }, "2": { "name": "Karka Queen", "chatlink": "[&BNUGAAA=]" }, "3": { "name": "Tequatl the Sunless", "chatlink": "[&BNABAAA=]" } }, "sequences": { "partial": [{ "r": 3, "d": 30 }, { "r": 0, "d": 30 }, { "r": 1, "d": 30 }, { "r": 0, "d": 30 }, { "r": 2, "d": 30 }, { "r": 0, "d": 30 }, { "r": 3, "d": 30 }, { "r": 0, "d": 30 }, { "r": 1, "d": 30 }, { "r": 0, "d": 90 }, { "r": 2, "d": 30 }, { "r": 0, "d": 30 }, { "r": 3, "d": 30 }, { "r": 0, "d": 30 }, { "r": 1, "d": 30 }, { "r": 0, "d": 120 }, { "r": 2, "d": 30 }, { "r": 0, "d": 30 }, { "r": 3, "d": 30 }, { "r": 0, "d": 30 }, { "r": 1, "d": 30 }, { "r": 0, "d": 120 }, { "r": 2, "d": 30 }, { "r": 0, "d": 30 }, { "r": 3, "d": 30 }, { "r": 0, "d": 30 }, { "r": 1, "d": 30 }, { "r": 0, "d": 30 }, { "r": 2, "d": 30 }, { "r": 0, "d": 30 }, { "r": 3, "d": 30 }, { "r": 0, "d": 30 }, { "r": 1, "d": 30 }, { "r": 0, "d": 150 }, { "r": 2, "d": 30 }, { "r": 0, "d": 30 }, { "r": 3, "d": 30 }, { "r": 0, "d": 30 }, { "r": 1, "d": 30 }], "pattern": [] } },
        "la": { "category": "Core Tyria", "name": "Ley-Line Anomaly", "segments": { "0": { "name": "" }, "1": { "name": "Timberline Falls", "chatlink": "[&BEwCAAA=]" }, "2": { "name": "Iron Marches", "chatlink": "[&BOcBAAA=]" }, "3": { "name": "Gendarran Fields", "chatlink": "[&BOQAAAA=]" } }, "sequences": { "partial": [{ "r": 0, "d": 20 }, { "r": 1, "d": 20 }, { "r": 0, "d": 100 }, { "r": 2, "d": 20 }, { "r": 0, "d": 100 }, { "r": 3, "d": 20 }], "pattern": [{ "r": 0, "d": 100 }, { "r": 1, "d": 20 }, { "r": 0, "d": 100 }, { "r": 2, "d": 20 }, { "r": 0, "d": 100 }, { "r": 3, "d": 20 }] } },
        "dt": { "category": "Living World Season 2", "name": "Dry Top", "segments": { "1": { "name": "Crash Site" }, "2": { "name": "Sandstorm", "chatlink": "[&BIAHAAA=]" } }, "sequences": { "partial": [], "pattern": [{ "r": 1, "d": 40 }, { "r": 2, "d": 20 }] } },
        "vb": { "category": "Heart of Thorns", "name": "Verdant Brink", "segments": { "1": { "name": "Day: Securing Verdant Brink" }, "2": { "name": "Night: Night and the Enemy" }, "3": { "name": "Verdant Brink Night Cycle", "chatlink": "[&BAgIAAA=]" } }, "sequences": { "partial": [{ "r": 2, "d": 10 }, { "r": 3, "d": 20 }], "pattern": [{ "r": 1, "d": 75 }, { "r": 2, "d": 25 }, { "r": 3, "d": 20 }] } },
        "ab": { "category": "Heart of Thorns", "name": "Auric Basin", "segments": { "1": { "name": "Pillars of Mordremoth (Octovine)", "chatlink": "[&BN0HAAA=]" }, "2": { "name": "Challenges", "chatlink": "[&BGwIAAA=]" }, "3": { "name": "Octovine", "chatlink": "[&BAIIAAA=]" }, "4": { "name": "Reset" } }, "sequences": { "partial": [{ "r": 1, "d": 45 }, { "r": 2, "d": 15 }, { "r": 3, "d": 20 }, { "r": 4, "d": 10 }], "pattern": [{ "r": 1, "d": 75 }, { "r": 2, "d": 15 }, { "r": 3, "d": 20 }, { "r": 4, "d": 10 }] } },
        "td": { "category": "Heart of Thorns", "name": "Tangled Depths", "segments": { "1": { "name": "Help the Outposts" }, "2": { "name": "Prep" }, "3": { "name": "King of the Jungle (Chak Gerent)", "chatlink": "[&BPUHAAA=]" } }, "sequences": { "partial": [{ "r": 1, "d": 25 }, { "r": 2, "d": 5 }, { "r": 3, "d": 20 }], "pattern": [{ "r": 1, "d": 95 }, { "r": 2, "d": 5 }, { "r": 3, "d": 20 }] } },
        "ds": { "category": "Heart of Thorns", "name": "Dragon's Stand", "segments": { "1": { "name": "Dragon's Stand (The Death of Mordremoth)", "chatlink": "[&BBAIAAA=]" }, "2": { "name": "(continued)" } }, "sequences": { "partial": [{ "r": 2, "d": 90 }], "pattern": [{ "r": 1, "d": 120 }] } },
        "di": { "category": "Living World Season 4", "name": "Domain of Istan", "segments": { "0": { "name": "" }, "1": { "name": "Palawadan, Jewel of Istan", "chatlink": "[&BAkLAAA=]" } }, "sequences": { "partial": [{ "r": 1, "d": 15 }], "pattern": [{ "r": 0, "d": 90 }, { "r": 1, "d": 30 }] } },
        "jb": { "category": "Living World Season 4", "name": "Jahai Bluffs", "segments": { "0": { "name": "" }, "1": { "name": "Escorts", "chatlink": "[&BIMLAAA=]" }, "2": { "name": "Death-Branded Shatterer", "chatlink": "[&BJMLAAA=]" } }, "sequences": { "partial": [{ "r": 0, "d": 60 }, { "r": 1, "d": 15 }, { "r": 2, "d": 15 }], "pattern": [{ "r": 0, "d": 90 }, { "r": 1, "d": 15 }, { "r": 2, "d": 15 }] } },
        "tp": { "category": "Living World Season 4", "name": "Thunderhead Peaks", "segments": { "0": { "name": "" }, "1": { "name": "Thunderhead Keep", "chatlink": "[&BLsLAAA=]" }, "2": { "name": "The Oil Floes", "chatlink": "[&BKYLAAA=]" } }, "sequences": { "partial": [{ "r": 1, "d": 5 }, { "r": 0, "d": 40 }, { "r": 2, "d": 15 }], "pattern": [{ "r": 0, "d": 45 }, { "r": 1, "d": 20 }, { "r": 0, "d": 40 }, { "r": 2, "d": 15 }] } },
        "gv": { "category": "The Icebrood Saga", "name": "Grothmar Valley", "segments": { "0": { "name": "" }, "1": { "name": "Effigy", "chatlink": "[&BA4MAAA=]" }, "2": { "name": "Doomlore Shrine", "chatlink": "[&BA4MAAA=]" }, "3": { "name": "Ooze Pits", "chatlink": "[&BPgLAAA=]" }, "4": { "name": "Metal Concert", "chatlink": "[&BPgLAAA=]" } }, "sequences": { "partial": [{ "r": 0, "d": 10 }], "pattern": [{ "r": 1, "d": 15 }, { "r": 0, "d": 13 }, { "r": 2, "d": 22 }, { "r": 0, "d": 5 }, { "r": 3, "d": 20 }, { "r": 0, "d": 15 }, { "r": 4, "d": 15 }, { "r": 0, "d": 15 }] } },
        "bm": { "category": "The Icebrood Saga", "name": "Bjora Marches", "segments": { "0": { "name": "" }, "1": { "name": "Drakkar", "chatlink": "[&BDkMAAA=]" }, "2": { "name": "Storms of Winter", "chatlink": "[&BCcMAAA=]" } }, "sequences": { "partial": [], "pattern": [{ "r": 0, "d": 45 }, { "r": 1, "d": 35 }, { "r": 0, "d": 5 }, { "r": 2, "d": 35 }] } },
        "dsp": { "category": "The Icebrood Saga", "name": "Dragonstorm", "segments": { "0": { "name": "" }, "1": { "name": "Dragonstorm", "chatlink": "[&BAkMAAA=]" } }, "sequences": { "partial": [{ "r": 0, "d": 60 }], "pattern": [{ "r": 1, "d": 20 }, { "r": 0, "d": 100 }] } },
        "sp": { "category": "End of Dragons", "name": "Seitung Province", "segments": { "0": { "name": "" }, "1": { "name": "Aetherblade Assault", "chatlink": "[&BGUNAAA=]" } }, "sequences": { "partial": [{ "r": 0, "d": 90 }], "pattern": [{ "r": 1, "d": 30 }, { "r": 0, "d": 90 }] } },
        "nkc": { "category": "End of Dragons", "name": "New Kaineng City", "segments": { "0": { "name": "" }, "1": { "name": "Kaineng Blackout", "chatlink": "[&BBkNAAA=]" } }, "sequences": { "partial": [], "pattern": [{ "r": 1, "d": 40 }, { "r": 0, "d": 80 }] } },
        "tew": { "category": "End of Dragons", "name": "The Echovald Wilds", "segments": { "0": { "name": "" }, "1": { "name": "Gang War", "chatlink": "[&BMwMAAA=]" }, "2": { "name": "Fort Aspenwood", "chatlink": "[&BPkMAAA=]" } }, "sequences": { "partial": [], "pattern": [{ "r": 0, "d": 30 }, { "r": 1, "d": 35 }, { "r": 0, "d": 35 }, { "r": 2, "d": 20 }] } },
        "dre": { "category": "End of Dragons", "name": "Dragon's End", "segments": { "1": { "name": "Preparations" }, "2": { "name": "Jade Maw" }, "3": { "name": "The Battle for the Jade Sea", "chatlink": "[&BKIMAAA=]" } }, "sequences": { "partial": [], "pattern": [{ "r": 1, "d": 5 }, { "r": 2, "d": 8 }, { "r": 1, "d": 32 }, { "r": 2, "d": 8 }, { "r": 1, "d": 7 }, { "r": 3, "d": 60 }] } }
    }
} as const;

// --- TYPE DEFINITIONS for App State ---
type AppEvent = {
    id: string; // A specific instance ID, e.g., wb_1_1678886400000
    stableId: string; // A stable ID for favoriting, e.g., wb_1
    name: string;
    map: string;
    category: 'Meta' | 'World Boss' | 'Other' | 'Filler';
    startTime: number;
    duration: number; // in minutes
    waypoint: string;
    isFiller?: boolean;
};

type Run = {
    id: string;
    name: string;
    events: AppEvent[];
};

type User = {
    email: string;
    settings: {
        gw2ApiKey: string;
        fastApiBaseUrl?: string;
    };
    savedRuns: Run[];
    favorites: string[]; // Stores stableIds of favorited events
};

type AppState = 'auth' | 'app';
type AppTab = 'toolkit' | 'savedRuns' | 'favorites' | 'dailyHelpers' | 'makeGold' | 'dailies' | 'account' | 'apiExplorer' | 'settings';
type FilterType = 'All' | 'Meta' | 'World Boss' | 'Other';

// --- TOAST NOTIFICATION SYSTEM ---
type ToastContextType = (message: string) => void;
const ToastContext = React.createContext<ToastContextType | null>(null);

const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

// --- HELPER FUNCTIONS & COMPONENTS ---

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="ti-reload animate-spin text-4xl text-indigo-400"></div>
    </div>
);

const useInterval = (callback: () => void, delay: number | null) => {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            const id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
};

const formatTime = (timestamp: number, withSeconds = false) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };
    if (withSeconds) {
        options.second = '2-digit';
    }
    return date.toLocaleTimeString('en-GB', options);
};


const formatDuration = (seconds: number) => {
    const isNegative = seconds < 0;
    if (isNegative) seconds = -seconds;

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const hStr = h > 0 ? `${h.toString().padStart(2, '0')}:` : '';
    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');

    return `${isNegative ? '-' : ''}${hStr}${mStr}:${sStr}`;
};

const getCategoryFromKey = (key: string): AppEvent['category'] => {
    const metaKeys = ['vb', 'ab', 'td', 'ds', 'di', 'jb', 'tp', 'gv', 'bm', 'dsp', 'sp', 'nkc', 'tew', 'dre'];
    const wbKeys = ['wb', 'hwb'];
    if (metaKeys.includes(key)) return 'Meta';
    if (wbKeys.includes(key)) return 'World Boss';
    return 'Other'; // Covers 'la', 'dt', etc.
};


const EventForm = ({ event, onSave, onCancel }: { event?: AppEvent, onSave: (event: AppEvent) => void, onCancel: () => void }) => {
    const [name, setName] = useState(event?.name || '');
    const [map, setMap] = useState(event?.map || '');
    const [category, setCategory] = useState<AppEvent['category']>(event?.category || 'Meta');
    const [startTime, setStartTime] = useState(event ? new Date(event.startTime).toISOString().substring(11, 16) : '');
    const [duration, setDuration] = useState(event?.duration.toString() || '15');
    const [waypoint, setWaypoint] = useState(event?.waypoint || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const [hours, minutes] = startTime.split(':').map(Number);
        const newStartTime = new Date();
        newStartTime.setHours(hours, minutes, 0, 0);

        onSave({
            id: event?.id || crypto.randomUUID(),
            stableId: event?.stableId || `custom_${Date.now()}`,
            name,
            map,
            category,
            startTime: newStartTime.getTime(),
            duration: parseInt(duration, 10),
            waypoint,
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="gw2-container-border p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
                <h2 className="text-xl font-bold text-white">{event ? 'Edit Event' : 'Add Event'}</h2>
                <input type="text" placeholder="Event Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-slate-700 rounded-md text-slate-200" required />
                <input type="text" placeholder="Map/Location" value={map} onChange={e => setMap(e.target.value)} className="w-full p-2 bg-slate-700 rounded-md text-slate-200" required />
                <select value={category} onChange={e => setCategory(e.target.value as AppEvent['category'])} className="w-full p-2 bg-slate-700 rounded-md text-slate-200">
                    <option value="Meta">Meta</option>
                    <option value="World Boss">World Boss</option>
                    <option value="Other">Other</option>
                    <option value="Filler">Filler</option>
                </select>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2 bg-slate-700 rounded-md text-slate-200" required />
                <input type="number" placeholder="Duration (minutes)" value={duration} onChange={e => setDuration(e.target.value)} className="w-full p-2 bg-slate-700 rounded-md text-slate-200" required />
                <input type="text" placeholder="Waypoint Code" value={waypoint} onChange={e => setWaypoint(e.target.value)} className="w-full p-2 bg-slate-700 rounded-md text-slate-200" />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onCancel} className="gw2-button bg-gray-600 hover:bg-gray-500">Cancel</button>
                    <button type="submit" className="gw2-button">Save</button>
                </div>
            </form>
        </div>
    );
};

const TimelineGraph = ({ events }: { events: AppEvent[] }) => {
    const graphRef = useRef<HTMLDivElement>(null);
    const [now, setNow] = useState(Date.now());
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
    const animationFrameId = useRef<number | undefined>(undefined);

    useEffect(() => {
        const animate = (_time: number) => {
            setNow(Date.now());
            animationFrameId.current = requestAnimationFrame(animate);
        };
        animationFrameId.current = requestAnimationFrame(animate);
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []);


    const { sessionStart, sessionEnd, lanes, graphHeight } = useMemo(() => {
        if (events.length === 0) {
            const d = new Date();
            d.setMinutes(0, 0, 0); // Floor to the start of the current hour
            const start = d.getTime();
            return {
                sessionStart: start,
                sessionEnd: start + 6 * 3600 * 1000,
                lanes: [],
                graphHeight: 20
            };
        }

        const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);
        const firstEventTime = sortedEvents[0].startTime;
        const d = new Date(firstEventTime);
        d.setMinutes(0, 0, 0); // Floor to the start of that event's hour
        const sessionStart = d.getTime();
        const sessionEnd = sessionStart + 6 * 60 * 60 * 1000;

        const eventLanes: AppEvent[][] = [];
        const laneHeight = 22; // Height of bar + gap
        for (const event of sortedEvents) {
            let placed = false;
            for (let i = 0; i < eventLanes.length; i++) {
                const lane = eventLanes[i];
                const hasOverlap = lane.some(e =>
                    (event.startTime < (e.startTime + e.duration * 60 * 1000)) &&
                    ((event.startTime + event.duration * 60 * 1000) > e.startTime)
                );
                if (!hasOverlap) {
                    lane.push(event);
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                eventLanes.push([event]);
            }
        }

        return { sessionStart, sessionEnd, lanes: eventLanes, graphHeight: eventLanes.length * laneHeight + 20 };
    }, [events]);

    const timeMarkers = useMemo(() => {
        const markers = [];
        const thirtyMins = 30 * 60 * 1000;
        let start = new Date(sessionStart);
        const startOffset = start.getMinutes() * 60 * 1000 + start.getSeconds() * 1000;
        let markerTime = start.getTime() - startOffset;

        for (let time = markerTime; time < sessionEnd; time += thirtyMins) {
            if (time >= sessionStart) markers.push(time);
        }
        return markers;
    }, [sessionStart, sessionEnd]);

    const totalDuration = sessionEnd - sessionStart;
    if (totalDuration <= 0) return null;

    const getPosition = (time: number) => ((time - sessionStart) / totalDuration) * 100;

    const categoryColor: Record<AppEvent['category'], string> = {
        'Meta': 'from-teal-500 to-teal-600',
        'World Boss': 'from-amber-500 to-amber-600',
        'Other': 'from-sky-500 to-sky-600',
        'Filler': 'from-slate-600 to-slate-700'
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, eventName: string) => {
        setTooltip({ x: e.pageX, y: e.pageY, content: eventName });
    };

    const nowPosition = getPosition(now);

    return (
        <div className="gw2-container-border p-4 pb-12 mb-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 text-center">Session Overview</h3>
            <div
                ref={graphRef}
                className="relative w-full"
                style={{ height: `${graphHeight}px` }}
                onMouseLeave={() => setTooltip(null)}
            >
                {lanes.map((lane, laneIndex) => (
                    lane.map((event) => {
                        const left = getPosition(event.startTime);
                        const width = Math.max(0, getPosition(event.startTime + event.duration * 60 * 1000) - left);
                        if (width <= 0 || left > 100 || left + width < 0) return null;

                        return (
                            <div key={event.id}
                                className={`absolute h-5 top-0 rounded-sm opacity-90 bg-gradient-to-r ${categoryColor[event.category]} border-r-2 border-slate-900 transition-transform duration-150 ease-in-out hover:scale-y-110 origin-bottom`}
                                style={{ top: `${laneIndex * 22}px`, left: `${left}%`, width: `${width}%` }}
                                onMouseMove={(e) => handleMouseMove(e, event.name)}
                            ></div>
                        );
                    })
                ))}

                {nowPosition >= 0 && nowPosition <= 100 && (
                    <div className="absolute top-0 bottom-0 flex flex-col items-center z-20" style={{ left: `${nowPosition}%`, transform: 'translateX(-50%)' }}>
                        <div className="w-0.5 h-full bg-red-500"></div>
                        <span className="text-xs font-bold text-red-200 bg-red-800/80 px-3 py-1 rounded-full -bottom-8 absolute whitespace-nowrap animate-pulse-glow">
                            NOW {formatTime(now, true)}
                        </span>
                    </div>
                )}
            </div>
            <div className="relative h-4 mt-2 w-full border-t border-slate-700">
                {timeMarkers.map(time => {
                    const left = getPosition(time);
                    if (left < 0 || left > 100) return null;
                    return (
                        <div key={time} className="absolute -top-4" style={{ left: `${left}%`, transform: 'translateX(-50%)' }}>
                            <div className="h-2 w-px bg-slate-600 absolute -top-1 left-1/2"></div>
                            <span className="text-xs text-slate-400">{formatTime(time)}</span>
                        </div>
                    )
                })}
            </div>
            {tooltip && (
                <div className="graph-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
                    {tooltip.content}
                </div>
            )}
        </div>
    );
};


// --- API & DATA HANDLING ---
const useUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [appState, setAppState] = useState<AppState>('auth');

    useEffect(() => {
        const loggedInUser = localStorage.getItem('gw2commkit_user');
        if (loggedInUser) {
            try {
                const loadedUser = JSON.parse(loggedInUser);
                const defaultUser: User = {
                    email: '',
                    settings: { gw2ApiKey: '', fastApiBaseUrl: 'http://localhost:8888' },
                    savedRuns: [],
                    favorites: []
                };

                const mergedUser = {
                    ...defaultUser,
                    ...loadedUser,
                    settings: { ...defaultUser.settings, ...(loadedUser.settings || {}) },
                    savedRuns: Array.isArray(loadedUser.savedRuns) ? loadedUser.savedRuns : [],
                    favorites: Array.isArray(loadedUser.favorites) ? loadedUser.favorites : []
                };

                setUser(mergedUser);
            } catch (error) {
                console.error("Failed to parse user data from local storage:", error);
                localStorage.removeItem('gw2commkit_user'); // Clear corrupted data
            } finally {
                setAppState('app');
            }
        } else {
            setAppState('auth');
        }
    }, []);

    const login = (email: string) => {
        const existingUsers = JSON.parse(localStorage.getItem('gw2commkit_users') || '{}');
        if (existingUsers[email]) {
            const loadedUser = existingUsers[email];
            const defaultUserStructure: Partial<User> = {
                savedRuns: [],
                favorites: [],
                settings: { gw2ApiKey: '', fastApiBaseUrl: 'http://localhost:8888' }
            };
            const fullUserData = { ...defaultUserStructure, ...loadedUser, email };
            localStorage.setItem('gw2commkit_user', JSON.stringify(fullUserData));
            setUser(fullUserData);
            setAppState('app');
        } else {
            alert('User not found. Please register.');
            return;
        }
    };

    const register = (email: string) => {
        const existingUsers = JSON.parse(localStorage.getItem('gw2commkit_users') || '{}');
        if (existingUsers[email]) {
            alert('User already exists. Please log in.');
            return;
        }
        const newUser: User = {
            email,
            settings: { gw2ApiKey: '', fastApiBaseUrl: 'http://localhost:8888' },
            savedRuns: [],
            favorites: [],
        };
        existingUsers[email] = newUser;
        localStorage.setItem('gw2commkit_users', JSON.stringify(existingUsers));
        login(email);
    };

    const logout = () => {
        localStorage.removeItem('gw2commkit_user');
        setUser(null);
        setAppState('auth');
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('gw2commkit_user', JSON.stringify(updatedUser));
        const existingUsers = JSON.parse(localStorage.getItem('gw2commkit_users') || '{}');
        existingUsers[updatedUser.email] = updatedUser;
        localStorage.setItem('gw2commkit_users', JSON.stringify(existingUsers));
    };

    return { user, login, register, logout, appState, updateUser };
};

const EventItem = ({
    event,
    isFavorite,
    onToggleFavorite,
    onEdit,
    onDelete,
    showAdminControls = true
}: {
    event: AppEvent;
    isFavorite: boolean;
    onToggleFavorite: (stableId: string) => void;
    onEdit: (event: AppEvent) => void;
    onDelete: (id: string) => void;
    showAdminControls?: boolean;
}) => {
    const [now, setNow] = useState(Date.now());
    const showToast = useToast();
    useInterval(() => setNow(Date.now()), 1000);

    const timeToStart = (event.startTime - now) / 1000;
    const timeToEnd = (event.startTime + event.duration * 60 * 1000 - now) / 1000;

    const timer = timeToStart > 0 ? formatDuration(timeToStart) : formatDuration(timeToEnd);
    const status = timeToStart > 0 ? 'Starts in' : 'Active for';

    const upcomingThreshold = 15 * 60; // 15 minutes
    const isUpcoming = timeToStart > 0 && timeToStart <= upcomingThreshold;
    const isActive = timeToStart <= 0 && timeToEnd > 0;

    const upcomingProgress = isUpcoming ? 100 - (timeToStart / upcomingThreshold) * 100 : 0;
    const activeProgress = isActive ? 100 - (timeToEnd / (event.duration * 60)) * 100 : 0;

    const categoryColor: Record<AppEvent['category'], string> = {
        'Meta': 'border-l-teal-400',
        'World Boss': 'border-l-amber-400',
        'Other': 'border-l-sky-400',
        'Filler': 'border-l-slate-500'
    };

    const handleCopy = () => {
        if (event.waypoint) {
            navigator.clipboard.writeText(event.waypoint).then(() => {
                showToast('Waypoint copied to clipboard!');
            }, () => {
                showToast('Failed to copy waypoint.');
            });
        }
    };

    return (
        <div className={`gw2-container-border p-3 mb-3 border-l-4 ${categoryColor[event.category]}`}>
            <div className="flex justify-between items-center gap-4">
                <div className="flex-grow">
                    <h4 className="font-bold text-white">{event.name}</h4>
                    <p className="text-sm text-slate-400">{event.map}</p>
                    <p className="text-xs text-indigo-300 font-mono mt-1">{event.waypoint || 'No Waypoint'}</p>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                    <div className="w-32">
                        <p className={`text-sm font-semibold ${isActive ? 'text-green-400' : 'text-slate-300'}`}>{status}</p>
                        <p className="text-xl font-mono tracking-tighter">{timer}</p>
                        <div className="w-full bg-slate-600 rounded-full h-1.5 mt-1">
                            {(isActive || isUpcoming) && (
                                <div
                                    className={`rounded-full h-1.5 ${isActive ? 'bg-green-500' : 'bg-yellow-500'}`}
                                    style={{ width: `${isActive ? activeProgress : upcomingProgress}%` }}
                                ></div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => onToggleFavorite(event.stableId)} className={`action-button ${isFavorite ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-slate-600 hover:bg-slate-500 text-slate-300'}`}>
                            <i className={`ti-star`}></i> Favorite
                        </button>
                        {showAdminControls && (
                            <>
                                <button onClick={() => onEdit(event)} className="action-button bg-slate-600 hover:bg-slate-500 text-slate-300">
                                    <i className="ti-pencil"></i> Edit
                                </button>
                                <button onClick={() => onDelete(event.id)} className="action-button bg-red-800 hover:bg-red-700 text-red-200">
                                    <i className="ti-trash"></i> Delete
                                </button>
                            </>
                        )}
                        {event.waypoint && (
                            <button onClick={handleCopy} className="action-button bg-indigo-700 hover:bg-indigo-600 text-indigo-200">
                                <i className="ti-layers"></i> Copy
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGES ---

function CommanderToolkitPage({ user, updateUser, events, setEvents }: { user: User; updateUser: (u: User) => void; events: AppEvent[]; setEvents: Dispatch<SetStateAction<AppEvent[]>> }) {
    const [isLoading, setIsLoading] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AppEvent | undefined>(undefined);
    const [filter, setFilter] = useState<FilterType>('All');
    const showToast = useToast();

    const handleSyncTimetable = useCallback(async (selectedFilter: FilterType = 'All') => {
        setIsLoading(true);
        setFilter(selectedFilter);
        const allEvents = calculateSchedule();
        const filtered = allEvents.filter(e => selectedFilter === 'All' || e.category === selectedFilter);
        setEvents(filtered);
        setIsLoading(false);
    }, [setEvents]);

    const handleRefreshFilteredTimetable = useCallback(async () => {
        setIsLoading(true);
        const allEvents = calculateSchedule();
        const filtered = allEvents.filter(e => filter === 'All' || e.category === filter || (filter === 'Other' && e.category === 'Filler'));
        setEvents(filtered);
        setIsLoading(false);
    }, [filter, setEvents]);

    const handleSaveEvent = (event: AppEvent) => {
        setEvents(prevEvents => {
            const existingIndex = prevEvents.findIndex(e => e.id === event.id);
            if (existingIndex > -1) {
                const newEvents = [...prevEvents];
                newEvents[existingIndex] = event;
                return newEvents.sort((a, b) => a.startTime - b.startTime);
            }
            return [...prevEvents, event].sort((a, b) => a.startTime - b.startTime);
        });
        setEditingEvent(undefined);
    };

    const handleDeleteEvent = (id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));
    };

    const handleSaveRun = () => {
        const runName = prompt("Enter a name for this run:");
        if (runName && user) {
            const newRun: Run = { id: crypto.randomUUID(), name: runName, events };
            updateUser({ ...user, savedRuns: [...user.savedRuns, newRun] });
            showToast(`Run "${runName}" saved!`);
        }
    };

    const handleToggleFavorite = (stableId: string) => {
        if (!user) return;
        const favorites = user.favorites || [];
        const isFav = favorites.includes(stableId);
        const newFavorites = isFav
            ? favorites.filter(id => id !== stableId)
            : [...favorites, stableId];
        updateUser({ ...user, favorites: newFavorites });
    };

    const filteredEvents = useMemo(() => {
        if (filter === 'All') return events;
        return events.filter(e => e.category === filter || (filter === 'Other' && e.category === 'Filler'));
    }, [events, filter]);

    return (
        <div>
            {editingEvent && <EventForm event={editingEvent} onSave={handleSaveEvent} onCancel={() => setEditingEvent(undefined)} />}

            {events.length > 0 && <TimelineGraph events={filteredEvents} />}

            <div className="gw2-container-border p-4 mb-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-slate-200 mb-3">Live Timetable</h3>
                        <div className="flex flex-wrap gap-2 items-center">
                            <button onClick={() => handleSyncTimetable('All')} className={`gw2-button text-sm ${filter === 'All' ? 'bg-indigo-500' : 'bg-slate-600'}`}>All</button>
                            <button onClick={() => setFilter('Meta')} className={`gw2-button text-sm ${filter === 'Meta' ? 'bg-indigo-500' : 'bg-slate-600'}`}>Meta</button>
                            <button onClick={() => setFilter('World Boss')} className={`gw2-button text-sm ${filter === 'World Boss' ? 'bg-indigo-500' : 'bg-slate-600'}`}>World Boss</button>
                            <button onClick={() => setFilter('Other')} className={`gw2-button text-sm ${filter === 'Other' ? 'bg-indigo-500' : 'bg-slate-600'}`}>Other</button>
                            <button onClick={handleRefreshFilteredTimetable} className="gw2-button bg-slate-600 hover:bg-slate-500" title="Refresh filtered view">
                                <i className="ti-reload"></i> Refresh
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => handleSyncTimetable(filter)} className="gw2-button" disabled={isLoading}><i className="ti-pulse"></i> Pull Live Data</button>
                        <button onClick={handleSaveRun} className="gw2-button" disabled={isLoading || events.length === 0}><i className="ti-save"></i> Save Run</button>
                    </div>
                </div>
            </div>

            {isLoading ? <LoadingSpinner /> : (
                <div className="space-y-2">
                    {filteredEvents.map(event => (
                        <EventItem
                            key={event.id}
                            event={event}
                            isFavorite={user.favorites?.includes(event.stableId) || false}
                            onToggleFavorite={handleToggleFavorite}
                            onEdit={setEditingEvent}
                            onDelete={handleDeleteEvent}
                        />
                    ))}
                    {filteredEvents.length === 0 && <p className="text-center text-slate-400 py-8">No events to display. Pull live data to get started.</p>}
                </div>
            )}
        </div>
    );
}

function SavedRunsPage({ user, updateUser, setEvents, setActiveTab }: { user: User; updateUser: (u: User) => void; setEvents: Dispatch<SetStateAction<AppEvent[]>>; setActiveTab: Dispatch<SetStateAction<AppTab>>; }) {
    const showToast = useToast();
    const deleteRun = (id: string) => {
        if (confirm("Are you sure you want to delete this run?")) {
            const newRuns = user.savedRuns.filter(run => run.id !== id);
            updateUser({ ...user, savedRuns: newRuns });
        }
    };

    const loadRun = (run: Run) => {
        setEvents(run.events);
        setActiveTab('toolkit');
        showToast(`Run "${run.name}" loaded!`);
    }

    return (
        <div className="gw2-container-border p-4">
            <h2 className="text-xl font-bold mb-4">Saved Runs</h2>
            {user.savedRuns.length === 0 ? <p>You have no saved runs.</p> : (
                <ul className="space-y-3">
                    {user.savedRuns.map(run => (
                        <li key={run.id} className="bg-slate-700 p-3 rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{run.name}</p>
                                <p className="text-sm text-slate-400">{run.events.length} events</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => loadRun(run)} className="gw2-button"><i className="ti-upload"></i> Load</button>
                                <button onClick={() => deleteRun(run.id)} className="gw2-button bg-red-800 hover:bg-red-700"><i className="ti-trash"></i> Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function FavoritesPage({ user, onToggleFavorite }: { user: User; onToggleFavorite: (stableId: string) => void; }) {
    const [allFavoriteEvents, setAllFavoriteEvents] = useState<AppEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('All');

    const refreshFavorites = useCallback(() => {
        setIsLoading(true);
        const allEvents = calculateSchedule();
        const userFavorites = user.favorites || [];
        const filtered = allEvents.filter(e => userFavorites.includes(e.stableId));
        setAllFavoriteEvents(filtered);
        setIsLoading(false);
    }, [user.favorites]);

    useEffect(() => {
        refreshFavorites();
    }, [refreshFavorites]);

    const filteredEvents = useMemo(() => {
        if (filter === 'All') return allFavoriteEvents;
        return allFavoriteEvents.filter(e => e.category === filter || (filter === 'Other' && e.category === 'Filler'));
    }, [allFavoriteEvents, filter]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <div className="gw2-container-border p-4 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">Favorites Overview</h2>
                    <div className="flex flex-wrap gap-2 items-center">
                        <button onClick={() => setFilter('All')} className={`gw2-button text-sm ${filter === 'All' ? 'bg-indigo-500' : 'bg-slate-600'}`}>All</button>
                        <button onClick={() => setFilter('Meta')} className={`gw2-button text-sm ${filter === 'Meta' ? 'bg-indigo-500' : 'bg-slate-600'}`}>Meta</button>
                        <button onClick={() => setFilter('World Boss')} className={`gw2-button text-sm ${filter === 'World Boss' ? 'bg-indigo-500' : 'bg-slate-600'}`}>World Boss</button>
                        <button onClick={() => setFilter('Other')} className={`gw2-button text-sm ${filter === 'Other' ? 'bg-indigo-500' : 'bg-slate-600'}`}>Other</button>
                        <button onClick={refreshFavorites} className="gw2-button bg-slate-600 hover:bg-slate-500" title="Refresh favorites schedule">
                            <i className="ti-reload"></i> Refresh
                        </button>
                    </div>
                </div>
            </div>

            {filteredEvents.length > 0 ? (
                <>
                    <TimelineGraph events={filteredEvents} />
                    {filteredEvents.map(event => (
                        <EventItem
                            key={event.id}
                            event={event}
                            isFavorite={true}
                            onToggleFavorite={onToggleFavorite}
                            onEdit={() => { }}
                            onDelete={() => { }}
                            showAdminControls={false}
                        />
                    ))}
                </>
            ) : (
                <p className="text-center text-slate-400 py-8">You haven't favorited any events yet. Star an event in the toolkit!</p>
            )}
        </div>
    );
}

function DailyHelpersPage() {
    const showToast = useToast();
    const psnaData = [
        "[&BIkHAAA=][&BDoBAAA=][&BO4CAAA=][&BC0AAAA=][&BIUCAAA=][&BCECAAA=]", // Sunday
        "[&BIcHAAA=][&BEwDAAA=][&BNIEAAA=][&BKYBAAA=][&BIMCAAA=][&BA8CAAA=]", // Monday
        "[&BH8HAAA=][&BEgAAAA=][&BKgCAAA=][&BBkAAAA=][&BGQCAAA=][&BIMBAAA=]", // Tuesday
        "[&BH4HAAA=][&BMIBAAA=][&BP0CAAA=][&BKYAAAA=][&BDgDAAA=][&BPEBAAA=]", // Wednesday
        "[&BKsHAAA=][&BE8AAAA=][&BP0DAAA=][&BIMAAAA=][&BF0GAAA=][&BOcBAAA=]", // Thursday
        "[&BJQHAAA=][&BMMCAAA=][&BJsCAAA=][&BNUGAAA=][&BHsBAAA=][&BNMAAAA=]", // Friday
        "[&BH8HAAA=][&BLkCAAA=][&BBEDAAA=][&BJIBAAA=][&BEICAAA=][&BBABAAA=]"  // Saturday
    ];

    const handleCopyPsna = () => {
        const now = new Date();
        const utcHour = now.getUTCHours();
        let utcDay = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

        let targetDayIndex;

        if (utcHour >= 8) {
            // After reset (08:00 UTC), use today's waypoints
            targetDayIndex = utcDay;
        } else {
            // Before reset, use yesterday's waypoints
            targetDayIndex = utcDay === 0 ? 6 : utcDay - 1; // If Sunday, use Saturday's
        }

        const waypoints = psnaData[targetDayIndex];

        navigator.clipboard.writeText(waypoints).then(() => {
            showToast('PSNA Waypoints copied to clipboard!');
        }, () => {
            showToast('Failed to copy waypoints.');
        });
    };

    const handleCopyFactionProvisioners = () => {
        const waypoints = "[&BAwEAAA=][&BKgDAAA=][&BP4EAAA=][&BIYDAAA=][&BLYEAAA=][&BLsEAAA=][&BN4HAAA=][&BNYHAAA=][&BMwHAAA=][&BCsOAAA=][&BOANAAA=][&BA4OAAA=][&BD8OAAA=][&BL4NAAA=][&BDQOAAA=][&BEcOAAA=][&BD0OAAA=][&BNMNAAA=][&BEIOAAA=][&BB8OAAA=]";
        navigator.clipboard.writeText(waypoints).then(() => {
            showToast('Faction Provisioner waypoints copied to clipboard!');
        }, () => {
            showToast('Failed to copy waypoints.');
        });
    };

    const handleCopySunkenChests = () => {
        const waypoints = "[&BAAEAAA=][&BKEAAAA=][&BCwAAAA=][&BCMAAAA=][&BOEBAAA=][&BJAAAAA=][&BOcFAAA=][&BEwGAAA=][&BD0CAAA=][&BI0GAAA=]";
        navigator.clipboard.writeText(waypoints).then(() => {
            showToast('Sunken Chest waypoints copied to clipboard!');
        }, () => {
            showToast('Failed to copy waypoints.');
        });
    };

    return (
        <div className="gw2-container-border p-6">
            <h2 className="text-2xl font-bold mb-4">Daily Helpers</h2>
            <div className="bg-slate-700/50 p-4 rounded-md mb-6">
                <h3 className="text-lg font-semibold text-slate-200">Pact Supply Network Agent</h3>
                <p className="text-slate-400 mt-1 mb-4">Copies the six waypoints for today's Pact Supply Network Agents. The vendors reset at 08:00 UTC.</p>
                <button onClick={handleCopyPsna} className="gw2-button">
                    <i className="ti-layers-alt mr-2"></i> Copy Today's PSNA Waypoints
                </button>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-md mb-6">
                <h3 className="text-lg font-semibold text-slate-200">Faction Provisioner Vendors</h3>
                <p className="text-slate-400 mt-1 mb-4">Copies all Faction Provisioner Vendor waypoints to the clipboard. These vendors are available once per day, per character.</p>
                <button onClick={handleCopyFactionProvisioners} className="gw2-button">
                    <i className="ti-package mr-2"></i> Copy Provisioner Waypoints
                </button>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-md mb-6">
                <h3 className="text-lg font-semibold text-slate-200">Sunken Chest Daily</h3>
                <p className="text-slate-400 mt-1 mb-4">Copies all Sunken Chest waypoints to the clipboard. These can be looted once per day, per account.</p>
                <button onClick={handleCopySunkenChests} className="gw2-button">
                    <i className="ti-anchor mr-2"></i> Copy Sunken Chest Waypoints
                </button>
            </div>
        </div>
    );
}

function MakeGoldPage() {
    const crystallineDustIcon = "https://wiki.guildwars2.com/images/4/42/Pile_of_Crystalline_Dust.png";
    const crestRecipes = [
        { name: "Assassin", icon: "https://wiki.guildwars2.com/images/f/f6/Crest_of_the_Assassin.png" },
        { name: "Magi", icon: "https://wiki.guildwars2.com/images/a/a4/Crest_of_the_Magi.png" },
        { name: "Rabid", icon: "https://wiki.guildwars2.com/images/0/07/Crest_of_the_Rabid.png" },
        { name: "Shaman", icon: "https://wiki.guildwars2.com/images/a/a8/Crest_of_the_Shaman.png" },
        { name: "Soldier", icon: "https://wiki.guildwars2.com/images/8/8e/Crest_of_the_Soldier.png" },
        { name: "Berserker", icon: "https://wiki.guildwars2.com/images/8/87/Crest_of_the_Berserker.png" },
        { name: "Valkyrie", icon: "https://wiki.guildwars2.com/images/1/18/Crest_of_the_Valkyrie.png" },
        { name: "Rampager", icon: "https://wiki.guildwars2.com/images/3/33/Crest_of_the_Rampager.png" },
        { name: "Knight", icon: "https://wiki.guildwars2.com/images/c/c6/Crest_of_the_Knight.png" },
        { name: "Cavalier", icon: "https://wiki.guildwars2.com/images/7/77/Crest_of_the_Cavalier.png" },
        { name: "Giver", icon: "https://wiki.guildwars2.com/images/4/4c/Crest_of_the_Giver.png" },
        { name: "Settler", icon: "https://wiki.guildwars2.com/images/6/67/Crest_of_the_Settler.png" },
        { name: "Cleric", icon: "https://wiki.guildwars2.com/images/c/c5/Crest_of_the_Cleric.png" },
        { name: "Apothecary", icon: "https://wiki.guildwars2.com/images/6/69/Crest_of_the_Apothecary.png" },
        { name: "Nomad", icon: "https://wiki.guildwars2.com/images/1/1b/Crest_of_the_Nomad.png" },
        { name: "Sinister", icon: "https://wiki.guildwars2.com/images/e/ed/Crest_of_the_Sinister.png" },
        { name: "Viper", icon: "https://wiki.guildwars2.com/images/b/b2/Crest_of_the_Viper.png" },
        { name: "Trailblazer", icon: "https://wiki.guildwars2.com/images/a/a4/Crest_of_the_Trailblazer.png" },
        { name: "Vigilant", icon: "https://wiki.guildwars2.com/images/8/8e/Crest_of_the_Vigilant.png" },
        { name: "Crusader", icon: "https://wiki.guildwars2.com/images/e/ef/Crest_of_the_Crusader.png" },
        { name: "Wanderer", icon: "https://wiki.guildwars2.com/images/f/f3/Crest_of_the_Wanderer.png" },
        { name: "Marshal", icon: "https://wiki.guildwars2.com/images/1/1a/Crest_of_the_Marshal.png" },
        { name: "Harrier", icon: "https://wiki.guildwars2.com/images/9/98/Crest_of_the_Harrier.png" },
        { name: "Commander", icon: "https://wiki.guildwars2.com/images/9/9f/Crest_of_the_Commander.png" },
        { name: "Diviner", icon: "https://wiki.guildwars2.com/images/8/8b/Crest_of_the_Diviner.png" },
        { name: "Grieving", icon: "https://wiki.guildwars2.com/images/e/e5/Crest_of_the_Grieving.png" },
        { name: "Plaguedoctor", icon: "https://wiki.guildwars2.com/images/c/c9/Crest_of_the_Plaguedoctor.png" },
        { name: "Ritualist", icon: "https://wiki.guildwars2.com/images/8/8c/Crest_of_the_Ritualist.png" },
        { name: "Dragon", icon: "https://wiki.guildwars2.com/images/e/e0/Crest_of_the_Dragon.png" }
    ];

    const inscriptionIcon = "https://wiki.guildwars2.com/images/2/29/Soldier%27s_Orichalcum-Imbued_Inscription.png";
    const ectoplasmIcon = "https://wiki.guildwars2.com/images/3/36/Glob_of_Ectoplasm.png";
    const guaranteedRecipes = [
        { name: "Beryl Shard", icon: "https://wiki.guildwars2.com/images/e/e0/Beryl_Shard.png" },
        { name: "Chrysocola Crystal", icon: "https://wiki.guildwars2.com/images/3/3d/Chrysocola_Crystal.png" },
        { name: "Coral Chunk", icon: "https://wiki.guildwars2.com/images/b/b1/Coral_Chunk.png" },
        { name: "Emerald Crystal", icon: "https://wiki.guildwars2.com/images/c/c5/Emerald_Crystal.png" },
        { name: "Lapis Lazuli Orb", icon: "https://wiki.guildwars2.com/images/3/31/Lapis_Lazuli_Orb.png" },
        { name: "Ruby Crystal", icon: "https://wiki.guildwars2.com/images/6/6b/Ruby_Crystal.png" },
        { name: "Sapphire Crystal", icon: "https://wiki.guildwars2.com/images/1/12/Sapphire_Crystal.png" },
        { name: "Freshwater Pearl", icon: "https://wiki.guildwars2.com/images/c/c5/Freshwater_Pearl.png" },
    ];


    return (
        <div className="gw2-container-border p-6">
            <h2 className="text-2xl font-bold mb-6">Make Gold</h2>

            <div className="bg-slate-800/50 p-4 rounded-md mb-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-2">Amalgamated Gemstones (Mystic Forge Chance)</h3>
                <p className="text-sm text-slate-400 mb-4">
                    Combine ingredients in the Mystic Forge. The following recipes use <span className="font-bold text-slate-300">1x Pile of Crystalline Dust</span> and <span className="font-bold text-slate-300">3x</span> of the same crest to produce <span className="font-bold text-slate-300">1x Amalgamated Gemstone</span> (with a rare chance of 5).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {crestRecipes.map((recipe) => (
                        <div key={recipe.name} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col">
                            <div className="p-3 text-center border-b-2 border-slate-900">
                                <h4 className="font-bold text-lg text-white">Amalgamated Gemstone</h4>
                            </div>

                            <div className="p-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Source</span>
                                    <span className="font-semibold text-sky-400">Mystic Forge</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Output qty.</span>
                                    <span className="font-semibold text-white">1</span>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-2 text-center">
                                <h5 className="font-bold text-md text-slate-300">Ingredients</h5>
                            </div>

                            <div className="p-3 flex-grow">
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-center gap-3">
                                        <span className="font-mono text-slate-400 w-4 text-center flex-shrink-0">1</span>
                                        <img src={crystallineDustIcon} alt="Pile of Crystalline Dust" className="w-6 h-6 rounded-sm flex-shrink-0" referrerPolicy="no-referrer" />
                                        <span className="flex-grow">Pile of Crystalline Dust</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="font-mono text-slate-400 w-4 text-center flex-shrink-0">3</span>
                                        <img src={recipe.icon} alt={`Crest of the ${recipe.name}`} className="w-6 h-6 rounded-sm flex-shrink-0" referrerPolicy="no-referrer" />
                                        <span className="flex-grow">Crest of the {recipe.name}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-md mb-6">
                <h3 className="text-xl font-semibold text-slate-200 mb-2">Amalgamated Gemstones (Guaranteed Recipes)</h3>
                <p className="text-sm text-slate-400 mb-4">
                    These recipes guarantee <span className="font-bold text-slate-300">1x Amalgamated Gemstone</span>. They require an Exotic Inscription, Globs of Ectoplasm, Piles of Crystalline Dust, and a Tier 6 fine gemstone.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {guaranteedRecipes.map((recipe) => (
                        <div key={recipe.name} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col">
                            <div className="p-3 text-center border-b-2 border-slate-900">
                                <h4 className="font-bold text-lg text-white">Amalgamated Gemstone</h4>
                            </div>

                            <div className="p-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Source</span>
                                    <span className="font-semibold text-sky-400">Mystic Forge</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Output qty.</span>
                                    <span className="font-semibold text-white">1</span>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-2 text-center">
                                <h5 className="font-bold text-md text-slate-300">Ingredients</h5>
                            </div>

                            <div className="p-3 flex-grow">
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-center gap-3">
                                        <span className="font-mono text-slate-400 w-5 text-center flex-shrink-0">1</span>
                                        <img src={inscriptionIcon} alt="Orichalcum-Imbued Inscription" className="w-6 h-6 rounded-sm flex-shrink-0" referrerPolicy="no-referrer" />
                                        <span className="flex-grow">Exotic Inscription</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="font-mono text-slate-400 w-5 text-center flex-shrink-0">1</span>
                                        <img src={ectoplasmIcon} alt="Glob of Ectoplasm" className="w-6 h-6 rounded-sm flex-shrink-0" referrerPolicy="no-referrer" />
                                        <span className="flex-grow">Glob of Ectoplasm</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="font-mono text-slate-400 w-5 text-center flex-shrink-0">50</span>
                                        <img src={crystallineDustIcon} alt="Pile of Crystalline Dust" className="w-6 h-6 rounded-sm flex-shrink-0" referrerPolicy="no-referrer" />
                                        <span className="flex-grow">Pile of Crystalline Dust</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="font-mono text-slate-400 w-5 text-center flex-shrink-0">1</span>
                                        <img src={recipe.icon} alt={recipe.name} className="w-6 h-6 rounded-sm flex-shrink-0" referrerPolicy="no-referrer" />
                                        <span className="flex-grow">{recipe.name}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-center text-slate-400 py-8">More gold-making tools coming soon!</p>
        </div>
    );
}

// --- TYPES for Dailies Page ---
type DailyAchievement = {
    id: number;
    name: string;
    icon: string;
    requirement: string;
};

type CategorizedDailies = {
    pve: DailyAchievement[];
    pvp: DailyAchievement[];
    wvw: DailyAchievement[];
    fractals: DailyAchievement[];
    special: DailyAchievement[];
    lws3: DailyAchievement[];
    lws4: DailyAchievement[];
    icebroodSaga: DailyAchievement[];
    endOfDragons: DailyAchievement[];
};

type GW2AccountAchievement = {
    id: number;
    done: boolean;
};

type GW2DailyInfo = {
    id: number;
    level: { min: number; max: number };
};

type GW2DailyApiResponse = Record<string, GW2DailyInfo[]>;

type WizardsVaultObjectiveProgress = {
    id: number;
    progress_current: number;
    progress_complete: number;
    claimed: boolean;
};

// The API returns an object with an 'objectives' key
type WizardsVaultApiResponse = {
    objectives: WizardsVaultObjectiveProgress[];
}

type WizardsVaultObjectiveDetails = {
    id: number;
    title: string;
    reward_id: number;
};

type WizardsVaultReward = {
    id: number;
    count: number;
};

type MergedWizardsVaultObjective = {
    id: number;
    title: string;
    progress_current: number;
    progress_complete: number;
    claimed: boolean;
    astral_acclaim: number;
};


function DailiesPage({ user, setActiveTab }: { user: User; setActiveTab: (tab: AppTab) => void }) {
    const [dailies, setDailies] = useState<CategorizedDailies | null>(null);
    const [wizardsVaultDailies, setWizardsVaultDailies] = useState<MergedWizardsVaultObjective[]>([]);
    const [completedAchievements, setCompletedAchievements] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);
    const showToast = useToast();
    const apiKey = user.settings.gw2ApiKey;

    const fetchDailies = useCallback(async () => {
        setLoading(true);
        setDailies(null);
        setCompletedAchievements(new Set());
        setWizardsVaultDailies([]);
        let toastMessage = "Dailies refreshed!";

        // Promise to fetch standard daily achievements
        const standardDailiesPromise = (async () => {
            const dailyRes = await fetch("https://api.guildwars2.com/v2/achievements/daily");
            if (!dailyRes.ok) throw new Error(`Standard Dailies API failed with status ${dailyRes.status}`);

            const dailyData: GW2DailyApiResponse = await dailyRes.json();
            const allIds = Object.values(dailyData).flat().map(entry => entry.id);
            if (allIds.length === 0) return { pve: [], pvp: [], wvw: [], fractals: [], special: [], lws3: [], lws4: [], icebroodSaga: [], endOfDragons: [] };

            const achievementsRes = await fetch(`https://api.guildwars2.com/v2/achievements?ids=${allIds.join(",")}`);
            if (!achievementsRes.ok) throw new Error(`Failed to fetch achievement details`);

            const achievementsData: DailyAchievement[] = await achievementsRes.json();
            const achievementsMap = new Map(achievementsData.map((a) => [a.id, a]));

            const categorized: CategorizedDailies = { pve: [], pvp: [], wvw: [], fractals: [], special: [], lws3: [], lws4: [], icebroodSaga: [], endOfDragons: [] };

            for (const categoryKey of ['pvp', 'wvw', 'fractals', 'special']) {
                const key = categoryKey as keyof GW2DailyApiResponse & keyof CategorizedDailies;
                if (dailyData[key]) {
                    categorized[key] = dailyData[key]
                        .map(daily => achievementsMap.get(daily.id))
                        .filter((a): a is DailyAchievement => !!a);
                }
            }

            const pveAchievements = dailyData.pve?.map(d => achievementsMap.get(d.id)).filter((a): a is DailyAchievement => !!a) || [];
            for (const ach of pveAchievements) {
                const name = ach.name.toLowerCase();
                if (name.includes('end of dragons')) categorized.endOfDragons.push(ach);
                else if (name.includes('icebrood saga')) categorized.icebroodSaga.push(ach);
                else if (name.includes('living world season 4')) categorized.lws4.push(ach);
                else if (name.includes('living world season 3')) categorized.lws3.push(ach);
                else categorized.pve.push(ach);
            }

            return categorized;
        })();

        // Promise to fetch account-related daily data
        const accountDataPromise = (async () => {
            if (!apiKey) return { completed: new Set<number>(), vault: [] };

            const completedPromise = fetch(`https://api.guildwars2.com/v2/account/achievements?access_token=${apiKey}`).then(res => res.ok ? res.json() : Promise.reject("Account completion fetch failed"));
            const vaultProgressPromise = fetch(`https://api.guildwars2.com/v2/account/wizardsvault/daily?access_token=${apiKey}`).then(res => res.ok ? res.json() : Promise.reject("Wizard's Vault progress fetch failed"));

            const [completedRes, vaultProgressRes] = await Promise.allSettled([completedPromise, vaultProgressPromise]);

            const completed = completedRes.status === 'fulfilled' ? new Set((completedRes.value as GW2AccountAchievement[]).filter(a => a.done).map(a => a.id)) : new Set<number>();

            const vaultApiResponse = vaultProgressRes.status === 'fulfilled' ? (vaultProgressRes.value as WizardsVaultApiResponse) : null;
            const vaultObjectives = Array.isArray(vaultApiResponse?.objectives) ? vaultApiResponse.objectives : [];

            if (vaultObjectives.length === 0) {
                return { completed, vault: [] };
            }

            const objectiveIds = vaultObjectives.map(o => o.id).join(',');
            const detailsRes = await fetch(`https://api.guildwars2.com/v2/wizardsvault/objectives?ids=${objectiveIds}`);
            if (!detailsRes.ok) return { completed, vault: [] };

            const detailsData: WizardsVaultObjectiveDetails[] = await detailsRes.json();
            const detailsMap = new Map(detailsData.map(d => [d.id, d]));

            const rewardIds = [...new Set(detailsData.map(d => d.reward_id))].join(',');
            const rewardsRes = await fetch(`https://api.guildwars2.com/v2/wizardsvault/rewards?ids=${rewardIds}`);
            if (!rewardsRes.ok) return { completed, vault: [] };

            const rewardsData: WizardsVaultReward[] = await rewardsRes.json();
            const rewardsMap = new Map(rewardsData.map(r => [r.id, r]));

            const vault = vaultObjectives.map(prog => {
                const detail = detailsMap.get(prog.id);
                const reward = detail ? rewardsMap.get(detail.reward_id) : undefined;
                return {
                    ...prog,
                    title: detail?.title || `Objective #${prog.id}`,
                    astral_acclaim: reward?.count || 0,
                };
            });

            return { completed, vault };
        })();

        const [dailiesResult, accountResult] = await Promise.allSettled([standardDailiesPromise, accountDataPromise]);

        if (dailiesResult.status === 'fulfilled') {
            setDailies(dailiesResult.value);
        } else {
            const reasonString = dailiesResult.reason instanceof Error ? dailiesResult.reason.message : String(dailiesResult.reason);
            console.error("Standard Dailies Error:", reasonString);
            if (reasonString.includes('503')) {
                toastMessage = "Could not load standard dailies. The Guild Wars 2 API is temporarily unavailable (503).";
            } else {
                toastMessage = "Failed to load standard dailies, but other data may be available.";
            }
        }

        if (accountResult.status === 'fulfilled') {
            setCompletedAchievements(accountResult.value.completed);
            setWizardsVaultDailies(accountResult.value.vault);
        } else {
            console.error("Account Data Error:", accountResult.reason);
            if (apiKey) toastMessage = "Failed to load account data. API key might be invalid or miss permissions.";
        }

        showToast(toastMessage);
        setLoading(false);
    }, [apiKey, showToast]);


    useEffect(() => {
        fetchDailies();
    }, [fetchDailies]);

    const renderCategory = (title: string, achievements: DailyAchievement[]) => {
        if (!achievements || achievements.length === 0) return null;
        return (
            <div className="bg-slate-700/50 p-4 rounded-md mb-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">{title}</h3>
                <ul className="space-y-3">
                    {achievements.map(ach => (
                        <li key={ach.id} className="flex items-center gap-4 p-2 bg-slate-800/60 rounded-md">
                            {ach.icon && <img src={ach.icon} alt="" className="w-8 h-8 rounded" />}
                            <div className="flex-grow">
                                <p className="font-semibold text-white">{ach.name}</p>
                                <p className="text-sm text-slate-400">{ach.requirement}</p>
                            </div>
                            {apiKey && (
                                completedAchievements.has(ach.id) ? (
                                    <span className="text-sm font-bold text-green-400 flex items-center gap-1.5"><i className="ti-check"></i>Completed</span>
                                ) : (
                                    <span className="text-sm text-slate-500">Incomplete</span>
                                )
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const renderWizardsVault = () => {
        if (!apiKey || wizardsVaultDailies.length === 0) return null;
        return (
            <div className="bg-slate-700/50 p-4 rounded-md mb-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Wizard's Vault Dailies</h3>
                <ul className="space-y-3">
                    {wizardsVaultDailies.map(obj => {
                        const progress = obj.progress_complete > 0 ? (obj.progress_current / obj.progress_complete) * 100 : 100;
                        return (
                            <li key={obj.id} className="flex items-center gap-4 p-3 bg-slate-800/60 rounded-md">
                                <div className="flex-grow">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <p className="font-semibold text-white">{obj.title}</p>
                                        <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                                            {obj.astral_acclaim}
                                            <img src="https://wiki.guildwars2.com/images/thumb/7/77/Astral_Acclaim.png/20px-Astral_Acclaim.png" alt="AA" className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-600 rounded-full h-2.5">
                                        <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1 text-right">{obj.progress_current} / {obj.progress_complete}</p>
                                </div>
                                {obj.claimed || obj.progress_current >= obj.progress_complete ? (
                                    <span className="text-sm font-bold text-green-400 flex items-center gap-1.5"><i className="ti-check"></i>Completed</span>
                                ) : (
                                    <span className="text-sm text-slate-500">Incomplete</span>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    };

    return (
        <div className="gw2-container-border p-6">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold">Daily Achievements</h2>
                <button onClick={fetchDailies} className="gw2-button" disabled={loading}>
                    <i className={`ti-reload ${loading ? 'animate-spin' : ''} mr-2`}></i> Refresh Dailies
                </button>
            </div>

            {!apiKey && (
                <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 p-4 rounded-md mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="font-bold">Add your API key for completion tracking.</p>
                        <p className="text-sm">The key needs the `progression` and `account` permissions.</p>
                    </div>
                    <button onClick={() => setActiveTab('settings')} className="gw2-button bg-yellow-600 hover:bg-yellow-500">Go to Settings</button>
                </div>
            )}

            {loading ? <LoadingSpinner /> : (
                <>
                    {renderWizardsVault()}
                    {dailies ? (
                        <>
                            {renderCategory("Daily End of Dragons", dailies.endOfDragons)}
                            {renderCategory("Daily Icebrood Saga", dailies.icebroodSaga)}
                            {renderCategory("Daily Living World Season 4", dailies.lws4)}
                            {renderCategory("Daily Living World Season 3", dailies.lws3)}
                            {renderCategory("PvE Dailies", dailies.pve)}
                            {renderCategory("PvP Dailies", dailies.pvp)}
                            {renderCategory("WvW Dailies", dailies.wvw)}
                            {renderCategory("Fractal Dailies", dailies.fractals)}
                            {renderCategory("Special Dailies", dailies.special)}
                        </>
                    ) : (
                        !loading && <p className="text-center text-slate-400 py-8">Could not load standard dailies. The API might be temporarily unavailable.</p>
                    )}
                </>
            )}
        </div>
    );
}

// --- TYPES for Account Page ---
type Dye = {
    id: number;
    name: string;
    base_rgb: [number, number, number];
    item: number;
};

const generateItemChatLink = (itemId: number): string => {
    const buffer = new ArrayBuffer(6);
    const view = new DataView(buffer);
    view.setUint8(0, 2); // Item type
    view.setUint8(1, 1); // Count
    view.setUint32(2, itemId, true); // Item ID (little-endian)
    const binaryString = Array.from(new Uint8Array(buffer)).map(b => String.fromCharCode(b)).join('');
    const base64String = btoa(binaryString);
    return `[&${base64String}]`;
};


function AccountDetailsPage({ user, setActiveTab }: { user: User; setActiveTab: (tab: AppTab) => void }) {
    const [dyes, setDyes] = useState<Dye[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const showToast = useToast();
    const apiKey = user.settings.gw2ApiKey;

    const fetchDyes = async () => {
        if (!apiKey) {
            showToast("Please add a GW2 API key in Settings.");
            return;
        }
        setIsLoading(true);
        setDyes([]);
        try {
            // Step 1 & 2: Get all dye IDs and unlocked dye IDs in parallel
            const allDyesPromise = fetch("https://api.guildwars2.com/v2/colors").then(res => {
                if (!res.ok) throw new Error("Failed to fetch the master dye list.");
                return res.json();
            });

            const unlockedDyesPromise = fetch("https://api.guildwars2.com/v2/account/dyes?access_token=" + apiKey).then(res => {
                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        throw new Error("Invalid API key or missing 'unlocks' permission.");
                    }
                    throw new Error(`Failed to fetch unlocked dye list. API returned status: ${res.status}`);
                }
                return res.json();
            });

            const [allDyeIds, unlockedDyeIds]: [number[], number[]] = await Promise.all([allDyesPromise, unlockedDyesPromise]);

            // Step 3: Find the locked dye IDs
            const unlockedIdsSet = new Set(unlockedDyeIds);
            const lockedDyeIds = allDyeIds.filter(id => !unlockedIdsSet.has(id));

            if (lockedDyeIds.length === 0) {
                showToast("Congratulations! You have unlocked all dyes.");
                setIsLoading(false);
                return;
            }

            // Step 4: Fetch locked dye details in chunks of 200
            const CHUNK_SIZE = 200;
            const allLockedDyeDetails: Dye[] = [];
            for (let i = 0; i < lockedDyeIds.length; i += CHUNK_SIZE) {
                const chunk = lockedDyeIds.slice(i, i + CHUNK_SIZE);
                const detailsRes = await fetch(`https://api.guildwars2.com/v2/colors?ids=${chunk.join(',')}`);
                if (detailsRes.ok) {
                    const detailsData: Dye[] = await detailsRes.json();
                    allLockedDyeDetails.push(...detailsData);
                } else {
                    console.warn(`Failed to fetch details for a chunk of dyes. Status: ${detailsRes.status}`);
                }
            }

            allLockedDyeDetails.sort((a, b) => a.name.localeCompare(b.name));
            setDyes(allLockedDyeDetails);
            showToast(`Found ${allLockedDyeDetails.length} locked dyes.`);

        } catch (err) {
            console.error("Error fetching dyes:", err);
            showToast(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = (link: string) => {
        navigator.clipboard.writeText(link).then(() => {
            showToast("Chat link copied!");
        }, () => {
            showToast("Failed to copy chat link.");
        });
    };

    return (
        <div className="gw2-container-border p-6">
            <h2 className="text-2xl font-bold mb-4">Account Details</h2>

            {!apiKey && (
                <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 p-4 rounded-md mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="font-bold">Add your API key to view account details.</p>
                        <p className="text-sm">The key needs `account` and `unlocks` permissions.</p>
                    </div>
                    <button onClick={() => setActiveTab('settings')} className="gw2-button bg-yellow-600 hover:bg-yellow-500">Go to Settings</button>
                </div>
            )}

            <div className="bg-slate-700/50 p-4 rounded-md">
                <h3 className="text-lg font-semibold text-slate-200">Locked Dyes</h3>
                <p className="text-slate-400 mt-1 mb-4">
                    Fetch a list of all dyes that are still locked on your account.
                </p>
                <button onClick={fetchDyes} className="gw2-button" disabled={isLoading || !apiKey}>
                    <i className={`ti-palette ${isLoading ? 'animate-spin' : ''} mr-2`}></i> Fetch Locked Dyes
                </button>

                {isLoading ? <LoadingSpinner /> : dyes.length > 0 ? (
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="border-b-2 border-slate-600 text-slate-300">
                                    <th className="p-3">Color</th>
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Chat Link</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {dyes.map(dye => {
                                    const chatLink = generateItemChatLink(dye.item);
                                    return (
                                        <tr key={dye.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                            <td className="p-2">
                                                <div className="w-10 h-10 rounded border border-slate-600" style={{ backgroundColor: `rgb(${dye.base_rgb.join(',')})` }}></div>
                                            </td>
                                            <td className="p-2 font-semibold">{dye.name}</td>
                                            <td className="p-2 font-mono text-indigo-300">{chatLink}</td>
                                            <td className="p-2 text-right">
                                                <button onClick={() => handleCopyLink(chatLink)} className="action-button bg-indigo-700 hover:bg-indigo-600 text-indigo-200">
                                                    <i className="ti-layers"></i> Copy
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function ApiExplorerPage({ user, setActiveTab }: { user: User; setActiveTab: (tab: AppTab) => void }) {
    const [endpoint, setEndpoint] = useState('/v2/account');
    const [apiProvider, setApiProvider] = useState<'gw2' | 'fastapi'>('gw2');
    const [response, setResponse] = useState('');
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showNetworkErrorHelp, setShowNetworkErrorHelp] = useState(false);
    const showToast = useToast();
    const apiKey = user.settings.gw2ApiKey;
    const fastApiBaseUrl = user.settings.fastApiBaseUrl || 'http://localhost:8888';

    const popularEndpoints = useMemo(() => {
        if (apiProvider === 'fastapi') {
            return [
                { label: 'Operational Check', value: '/v1/' },
                { label: 'Cached Account', value: 'account' },
                { label: 'Cached Characters', value: 'characters' },
                { label: 'Cached Wallet', value: 'wallet' },
                { label: 'Cached Buys', value: 'commerce/transactions/current/buys' },
                { label: 'Cached Sells', value: 'commerce/transactions/current/sells' },
            ];
        }
        return [
            { label: 'Account Info', value: '/v2/account' },
            { label: 'Account Wallet', value: '/v2/account/wallet' },
            { label: 'Characters List', value: '/v2/characters' },
            { label: 'Currencies', value: '/v2/currencies' },
            { label: 'Item Details', value: '/v2/items' },
            { label: 'Commerce Listings', value: '/v2/commerce/listings' },
            { label: 'Commerce Prices', value: '/v2/commerce/prices' },
            { label: 'Gem Exchange', value: '/v2/commerce/exchange/gems' },
            { label: 'Current Game Build', value: '/v2/build' },
            { label: 'All World IDs', value: '/v2/worlds' },
        ];
    }, [apiProvider]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value) {
            setEndpoint(value);
        }
    };

    const handleSendRequest = async () => {
        setIsLoading(true);
        setResponse('');
        setStatus('');
        setShowNetworkErrorHelp(false);

        const isProtected = endpoint.startsWith('/v2/account') || endpoint.startsWith('/v2/characters') || endpoint.startsWith('/v2/guild') || endpoint.startsWith('/v2/commerce/transactions');

        if (apiProvider === 'gw2' && isProtected && !apiKey) {
            showToast("This endpoint requires an API key. Please add one in Settings.");
            setIsLoading(false);
            setStatus('Error: API Key Required');
            return;
        }

        let url = '';
        if (apiProvider === 'gw2') {
            if (!endpoint.startsWith('/v2/')) {
                showToast("Invalid GW2 endpoint. It must start with /v2/");
                setIsLoading(false);
                return;
            }
            url = `https://api.guildwars2.com${endpoint}`;
        } else {
            // FastAPI
            if (endpoint === '/v1/') {
                url = `${fastApiBaseUrl}${endpoint}`;
            } else {
                url = `${fastApiBaseUrl}/v1/data/${endpoint}`;
            }
        }

        try {
            const headers: HeadersInit = {};
            if (apiProvider === 'gw2' && isProtected && apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
            }

            const res = await fetch(url, { headers });

            setStatus(`Status: ${res.status} ${res.statusText}`);
            const responseText = await res.text();
            try {
                const data = JSON.parse(responseText);
                setResponse(JSON.stringify(data, null, 2));
            } catch {
                setResponse(responseText); // Show raw text if not valid JSON
            }

        } catch (error) {
            console.error("API Explorer Error:", error);
            const isNetworkError = error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch');

            if (isNetworkError) {
                setStatus(`Error: The request was blocked by the browser (NetworkError).`);
                setShowNetworkErrorHelp(true);
            } else {
                const errorMessage = error instanceof Error ? error.message : "An unknown network error occurred";
                setStatus(`Error: ${errorMessage}`);
            }
            setResponse('');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="gw2-container-border p-6">
            <h2 className="text-2xl font-bold mb-4">API Explorer</h2>

            {!apiKey && apiProvider === 'gw2' && (
                <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 p-4 rounded-md mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="font-bold">Add your API key to use authenticated endpoints.</p>
                        <p className="text-sm">Endpoints like `/v2/account` require a key with the correct permissions.</p>
                    </div>
                    <button onClick={() => setActiveTab('settings')} className="gw2-button bg-yellow-600 hover:bg-yellow-500">Go to Settings</button>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">API Provider</label>
                    <div className="flex bg-slate-700 rounded-md p-1 gap-1">
                        <button
                            onClick={() => { setApiProvider('gw2'); setEndpoint('/v2/account'); }}
                            className={`flex-1 py-1 rounded-sm text-sm font-medium transition-colors ${apiProvider === 'gw2' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            Official GW2 API
                        </button>
                        <button
                            onClick={() => { setApiProvider('fastapi'); setEndpoint('/v1/'); }}
                            className={`flex-1 py-1 rounded-sm text-sm font-medium transition-colors ${apiProvider === 'fastapi' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        >
                            Fast-API (Local)
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="endpoint-select" className="block text-sm font-medium text-slate-300 mb-1">Popular Endpoints</label>
                    <select
                        id="endpoint-select"
                        onChange={handleSelectChange}
                        className="w-full p-2 bg-slate-700 rounded-md text-slate-200 mb-2"
                        value=""
                    >
                        <option value="" disabled>Select a popular endpoint to pre-fill the URL...</option>
                        {popularEndpoints.map(ep => (
                            <option key={ep.value} value={ep.value}>{ep.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="endpoint-input" className="block text-sm font-medium text-slate-300 mb-1">Request URL</label>
                    <div className="flex gap-2">
                        <span className="flex items-center px-3 bg-slate-700 border border-slate-600 rounded-l-md text-slate-400 font-mono text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                            {apiProvider === 'gw2' ? 'https://api.guildwars2.com' : fastApiBaseUrl}
                        </span>
                        <input
                            id="endpoint-input"
                            type="text"
                            value={endpoint}
                            onChange={e => setEndpoint(e.target.value)}
                            className="w-full p-2 bg-slate-900 rounded-r-md text-slate-200 font-mono"
                            placeholder={apiProvider === 'gw2' ? "/v2/..." : "/..."}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button onClick={handleSendRequest} className="gw2-button" disabled={isLoading}>
                        {isLoading ? <><i className="ti-reload animate-spin"></i> Sending...</> : <><i className="ti-control-play"></i> Send Request</>}
                    </button>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Response</h3>
                    <div className="gw2-container-border !bg-slate-900 p-4 rounded-lg min-h-[200px] max-h-[500px] overflow-y-auto">
                        <p className="text-sm font-mono whitespace-nowrap mb-4">{status}</p>
                        <pre className="text-sm whitespace-pre-wrap break-all"><code>{response || (isLoading ? 'Loading...' : 'Response data will appear here.')}</code></pre>
                    </div>
                </div>

                {showNetworkErrorHelp && (
                    <div className="mt-4 gw2-container-border border-amber-600 !bg-amber-900/20 p-4">
                        <h4 className="font-bold text-amber-300 text-lg mb-2">Troubleshooting Network Errors</h4>
                        <p className="text-sm text-amber-200 mb-3">
                            This error usually means your browser or network is preventing the request from completing. It's not an issue with the Guild Wars 2 API itself. Here are the most common causes:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-sm text-amber-200">
                            <li>
                                <span className="font-semibold">Mixed Content / Localhost:</span> If using Fast-API, ensure your browser allows requests to `http` (localhost) from an `https` / unknown origin, or that CORS is enabled on your Python server.
                            </li>
                            <li>
                                <span className="font-semibold">Browser Extensions:</span> Ad-blockers or privacy extensions can block API requests.
                            </li>
                            <li>
                                <span className="font-semibold">CORS Policy:</span> The server must allow cross-origin requests.
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}


function SettingsPage({ user, updateUser, onLogout }: { user: User, updateUser: (u: User) => void, onLogout: () => void }) {
    const [gw2ApiKey, setGw2ApiKey] = useState(user.settings.gw2ApiKey || '');
    const [fastApiBaseUrl, setFastApiBaseUrl] = useState(user.settings.fastApiBaseUrl || 'http://localhost:8888');
    const showToast = useToast();

    const handleSave = () => {
        updateUser({
            ...user,
            settings: {
                gw2ApiKey: gw2ApiKey,
                fastApiBaseUrl: fastApiBaseUrl
            }
        });
        showToast('Settings saved!');
    };

    const handlePopulateDb = async () => {
        if (!gw2ApiKey) {
            showToast('Please enter your GW2 API key before populating the database.');
            return;
        }

        showToast('Starting database population...'); // Give immediate feedback

        try {
            const response = await fetch(`${fastApiBaseUrl}/v1/populate-db`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ apiKey: gw2ApiKey }),
            });

            const result = await response.json();

            if (response.ok) {
                const { successful_endpoints = [], failed_endpoints = [] } = result;
                let summary = `DB Population Complete. Success: ${successful_endpoints.length}, Failed: ${failed_endpoints.length}.`;
                if (failed_endpoints.length > 0) {
                    summary += ` Check console for details on failures.`;
                    console.error('Failed endpoints:', failed_endpoints);
                }
                showToast(summary);
            } else {
                // Handle HTTP errors from the backend (e.g., 401, 503)
                const errorDetail = result.detail || `HTTP ${response.status}: ${response.statusText}`;
                showToast(`Error: ${errorDetail}`);
                console.error('Failed to populate database:', errorDetail);
            }
        } catch (error) {
            showToast('Network Error: Could not connect to the backend. Is it running?');
            console.error('Error populating database:', error);
        }
    };

    return (
        <div className="gw2-container-border p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <div className="space-y-6">
                <div>
                    <label htmlFor="gw2-key" className="block text-lg font-medium text-slate-300 mb-2">Guild Wars 2 API Key</label>
                    <input id="gw2-key" type="password" value={gw2ApiKey} onChange={e => setGw2ApiKey(e.target.value)} className="w-full p-2 bg-slate-700 rounded-md text-slate-200" placeholder="Enter your GW2 API Key" />
                    <p className="text-sm text-slate-400 mt-2">Used for tracking daily achievements and account details. Requires `account`, `progression`, and `unlocks` permissions.</p>
                </div>

                <div className="pt-4 border-t border-slate-700">
                    <h3 className="text-xl font-bold mb-4">Backend Settings</h3>
                    <label htmlFor="fast-api-url" className="block text-lg font-medium text-slate-300 mb-2">Fast-API Base URL</label>
                    <input id="fast-api-url" type="text" value={fastApiBaseUrl} onChange={e => setFastApiBaseUrl(e.target.value)} className="w-full p-2 bg-slate-700 rounded-md text-slate-200" placeholder="http://localhost:8888" />
                    <p className="text-sm text-slate-400 mt-2">URL for your local Fast-API backend service. Used in API Explorer.</p>
                    <button onClick={handlePopulateDb} className="gw2-button mt-4">Create and Populate Local Database</button>
                </div>

                <div className="flex justify-between items-center pt-8">
                    <button onClick={onLogout} className="gw2-button bg-red-800 hover:bg-red-700">Logout</button>
                    <button onClick={handleSave} className="gw2-button">Save Settings</button>
                </div>
            </div>
        </div>
    );
}

function AuthPage({ onLogin, onRegister }: { onLogin: (email: string) => void, onRegister: (email: string) => void }) {
    const [email, setEmail] = useState('');
    const [isRegister, setIsRegister] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isRegister) {
            onRegister(email);
        } else {
            onLogin(email);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="gw2-container-border p-8 rounded-lg shadow-lg w-full max-w-sm">
                <h1 className="text-3xl font-bold text-center text-white mb-2">GW2 CommKit</h1>
                <p className="text-center text-slate-400 mb-6">{isRegister ? "Create a new local profile" : "Log in to your profile"}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full p-3 bg-slate-700 rounded-md text-slate-200"
                        required
                    />
                    <button type="submit" className="gw2-button w-full !py-3">{isRegister ? 'Register' : 'Login'}</button>
                </form>
                <div className="mt-4 text-center">
                    <button onClick={() => setIsRegister(!isRegister)} className="text-sm text-indigo-400 hover:underline">
                        {isRegister ? "Already have a profile? Log in." : "Don't have a profile? Register."}
                    </button>
                </div>
                <p className="text-xs text-slate-500 text-center mt-6">Your profile is stored locally in your browser and is not sent to any server.</p>
            </div>
        </div>
    );
}

const calculateSchedule = (lookaheadHours = 6): AppEvent[] => {
    const allEvents: AppEvent[] = [];
    const now_ms = Date.now();
    const epoch = Date.UTC(2015, 4, 23); // A rough epoch for GW2 timers
    const lookahead_ms = lookaheadHours * 3600 * 1000;

    for (const key in GW2_NINJA_TIMER_DATA.events) {
        const timer: EventTimerInfo = GW2_NINJA_TIMER_DATA.events[key as keyof typeof GW2_NINJA_TIMER_DATA.events];

        let partial_duration_m = 0;
        for (const item of timer.sequences.partial) {
            partial_duration_m += item.d;
        }

        let pattern_duration_m = 0;
        for (const item of timer.sequences.pattern) {
            pattern_duration_m += item.d;
        }

        if (pattern_duration_m === 0 && partial_duration_m === 0) continue;

        let base_time_ms = epoch;

        for (const item of timer.sequences.partial) {
            const segment = (timer.segments as Record<string, Segment>)[item.r.toString()];
            if (segment && segment.name) {
                allEvents.push({
                    id: `${key}_${item.r}_${base_time_ms}`,
                    stableId: `${key}_${item.r}`,
                    name: segment.name,
                    map: timer.name,
                    category: getCategoryFromKey(key),
                    startTime: base_time_ms,
                    duration: item.d,
                    waypoint: segment.chatlink || '',
                });
            }
            base_time_ms += item.d * 60 * 1000;
        }

        if (pattern_duration_m > 0) {
            const pattern_duration_ms = pattern_duration_m * 60 * 1000;
            const time_since_base_ms = now_ms - base_time_ms;
            const patterns_passed = Math.floor(time_since_base_ms / pattern_duration_ms);

            let current_cycle_start_ms = base_time_ms + (patterns_passed * pattern_duration_ms);

            for (let i = 0; i < 3; i++) { // Project 3 cycles to be safe
                for (const item of timer.sequences.pattern) {
                    const segment = (timer.segments as Record<string, Segment>)[item.r.toString()];
                    if (segment && segment.name) {
                        allEvents.push({
                            id: `${key}_${item.r}_${current_cycle_start_ms}`,
                            stableId: `${key}_${item.r}`,
                            name: segment.name,
                            map: timer.name,
                            category: getCategoryFromKey(key),
                            startTime: current_cycle_start_ms,
                            duration: item.d,
                            waypoint: segment.chatlink || '',
                        });
                    }
                    current_cycle_start_ms += item.d * 60 * 1000;
                }
            }
        }
    }

    return allEvents
        .filter(event => event.startTime >= now_ms - (30 * 60 * 1000) && event.startTime < now_ms + lookahead_ms)
        .sort((a, b) => a.startTime - b.startTime);
};


function App() {
    const { user, updateUser, logout } = useUser();
    const [activeTab, setActiveTab] = useState<AppTab>('toolkit');
    const [events, setEvents] = useState<AppEvent[]>([]);

    if (!user) return <LoadingSpinner />;

    const handleToggleFavorite = (stableId: string) => {
        const favorites = user.favorites || [];
        const isFav = favorites.includes(stableId);
        const newFavorites = isFav
            ? favorites.filter(id => id !== stableId)
            : [...favorites, stableId];
        updateUser({ ...user, favorites: newFavorites });
    };

    const renderTab = () => {
        switch (activeTab) {
            case 'toolkit': return <CommanderToolkitPage user={user} updateUser={updateUser} events={events} setEvents={setEvents} />;
            case 'savedRuns': return <SavedRunsPage user={user} updateUser={updateUser} setEvents={setEvents} setActiveTab={setActiveTab} />;
            case 'favorites': return <FavoritesPage user={user} onToggleFavorite={handleToggleFavorite} />;
            case 'dailyHelpers': return <DailyHelpersPage />;
            case 'makeGold': return <MakeGoldPage />;
            case 'dailies': return <DailiesPage user={user} setActiveTab={setActiveTab} />;
            case 'account': return <AccountDetailsPage user={user} setActiveTab={setActiveTab} />;
            case 'apiExplorer': return <ApiExplorerPage user={user} setActiveTab={setActiveTab} />;
            case 'settings': return <SettingsPage user={user} updateUser={updateUser} onLogout={logout} />;
            default: return <CommanderToolkitPage user={user} updateUser={updateUser} events={events} setEvents={setEvents} />;
        }
    };

    const navItemClass = (tab: AppTab) => `px-4 py-2 font-semibold rounded-md transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`;

    return (
        <div className="max-w-7xl mx-auto p-4">
            <header className="mb-6 flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-white">GW2 Commander's Toolkit</h1>
                <nav className="gw2-container-border p-1 rounded-lg flex flex-wrap gap-1">
                    <button onClick={() => setActiveTab('toolkit')} className={navItemClass('toolkit')}><i className="ti-crown mr-2"></i>Toolkit</button>
                    <button onClick={() => setActiveTab('savedRuns')} className={navItemClass('savedRuns')}><i className="ti-save mr-2"></i>Runs</button>
                    <button onClick={() => setActiveTab('favorites')} className={navItemClass('favorites')}><i className="ti-star mr-2"></i>Favorites</button>
                    <button onClick={() => setActiveTab('dailyHelpers')} className={navItemClass('dailyHelpers')}><i className="ti-medall mr-2"></i>Helpers</button>
                    <button onClick={() => setActiveTab('dailies')} className={navItemClass('dailies')}><i className="ti-check-box mr-2"></i>Dailies</button>
                    <button onClick={() => setActiveTab('makeGold')} className={navItemClass('makeGold')}><i className="ti-money mr-2"></i>Make Gold</button>
                    <button onClick={() => setActiveTab('account')} className={navItemClass('account')}><i className="ti-user mr-2"></i>Account</button>
                    <button onClick={() => setActiveTab('apiExplorer')} className={navItemClass('apiExplorer')}><i className="ti-plug mr-2"></i>API Explorer</button>
                    <button onClick={() => setActiveTab('settings')} className={navItemClass('settings')}><i className="ti-settings mr-2"></i>Settings</button>
                </nav>
            </header>
            <main>
                {renderTab()}
            </main>
        </div>
    );
}

function AppContainer() {
    const { appState, user, login, register, logout } = useUser();
    const [toast, setToast] = useState<string | null>(null);

    const showToast = useCallback((message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 3500); // 3s display, 0.5s fade-out
    }, []);

    if (appState === 'auth') {
        return <AuthPage onLogin={login} onRegister={register} />;
    }

    if (appState === 'app' && user) {
        return (
            <ToastContext.Provider value={showToast}>
                <App />
                {toast && (
                    <div className="fixed bottom-5 right-5 gw2-container-border bg-indigo-600 text-white p-4 rounded-lg shadow-lg z-[100] animate-fade-in-out">
                        <p>{toast}</p>
                    </div>
                )}
            </ToastContext.Provider>
        );
    }

    return <LoadingSpinner />;
}

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<AppContainer />);
