import React, { useState, useMemo } from 'react';

// ==========================================
// 型定義
// ==========================================
interface WorkRecord {
  date: string;
  hours: number;
  timeRange: string;
}

interface MonthData {
  monthLabel: string;
  cumulativeHours: number;
  cumulativeSalary: number;
  records: WorkRecord[];
}

type SkillStatus = 'none' | 'pending' | 'approved';

interface ActiveCall {
  id: number;
  targetName: string;
  reasonLabel: string;
  priority: string;
  color: string;
  calledAt: string;
}

interface SkillTier {
  name: string;
  level: string;
  range: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
  color: string;
  barColor: string;
  badgeBg: string;
}

// ==========================================
// 1. 自社向けカスタマイズ設定エリア
// ==========================================
const CALL_REASONS = [
  { id: 1, label: '【緊急】 怪我・トラブル', priority: '高', color: 'bg-red-500 text-white' },
  { id: 2, label: '【優先】 機器不良', priority: '中', color: 'bg-amber-500 text-white' },
  { id: 3, label: '【確認】 在庫確認', priority: '低', color: 'bg-blue-500 text-white' },
  { id: 4, label: '【相談】 その他', priority: '低', color: 'bg-slate-600 text-white' },
];

const SKILL_LIST = [
  '【発注】入力業務', '【発注】新発注補助Ｓ操作', '【発注】直送発注', '【発注】移動対応',
  '【入荷】入荷照合', '【棚入】棚入', '【棚入】棚番メンテナンス', '【棚入】セット組み・得意先依頼加工',
  '【出荷】受注引当（集計）', '【出荷】ピッキング ＨＴ', '【出荷】ピッキングリスト', '【出荷】ケースラベル',
  '【出荷】不定形 ＨＴ', '【返品】店返品作業', '【返品】店返品棚戻', '【返品】仕入れ返品作業',
  '【棚卸】カウント', '【事務業務】仕入', '【事務業務】売上', '【事務業務】出荷事務', '【その他】フォークリフト乗務',
];

const CURRENT_USER = {
  id: 'user_182',
  name: '佐々木 深',
  center: 'YDC伊勢原',
  hourlyWage: 1200,
  monthlyLikeLimit: 3,
};

const SHIFT_SCHEDULE = {
  targetWeek: '2026年11月9日(月) 〜 11月15日(日)',
  deadline: '2026年11月4日(水) 23:59',
};

const STAFF_LIST = [
  { id: 'staff_1', name: '木村裕一', center: 'SC本部' }, { id: 'staff_2', name: '島木一友', center: 'SC本部' },
  { id: 'staff_3', name: '猪熊啓吾', center: 'SC本部' }, { id: 'staff_4', name: '岩田能啓', center: 'SC本部' },
  { id: 'staff_5', name: '石田裕信', center: 'SC本部' },
];

const LIKE_TARGET_LIST = [
  { id: 'u01', name: '堀田 大暉' }, { id: 'u02', name: '五十嵐 聖己' }, { id: 'u03', name: '奥山 政幸' },
  { id: 'u04', name: '湯谷 杏吏' }, { id: 'u05', name: '菅田 真啓' }, { id: 'u06', name: '松井 蓮之' },
  { id: 'u07', name: '中島元彦' }, { id: 'u08', name: '武田英寿' }, { id: 'u09', name: '宮崎鴻' },
  { id: 'u10', name: '鎌田大夢' }, { id: 'u11', name: '小林 心' }, { id: 'u14', name: '相良 竜之介' },
  { id: 'u15', name: '南 創太' }, { id: 'u17', name: '工藤 蒼生' }, { id: 'u20', name: '中田 有祐' },
  { id: 'u22', name: '髙田 椋汰' }, { id: 'u23', name: '有田 恵人' }, { id: 'u24', name: '永井 大義' },
  { id: 'u26', name: '横山 颯大' }, { id: 'u27', name: '岩渕 弘人' }, { id: 'u29', name: '松澤 香輝' },
  { id: 'u30', name: '西丸 道人' }, { id: 'u33', name: '林 彰洋' }, { id: 'u34', name: '古屋 歩夢' },
  { id: 'u37', name: '杉山 耀建' }, { id: 'u40', name: '安野 匠' }, { id: 'u41', name: '髙橋 一平' },
  { id: 'u42', name: '石井 隼太' }, { id: 'u44', name: '井上 詩音' }, { id: 'u47', name: '荒木 駿太' },
  { id: 'u55', name: '韓 浩康' },
];

// 全国1,000人規模のスキル分布定義
const SKILL_TIERS: SkillTier[] = [
  { name: 'マスター', level: 'S級', range: '10個以上', min: 10, max: 21, count: 50, percentage: 5.0, color: 'text-amber-600', barColor: 'bg-amber-500', badgeBg: 'bg-amber-100 text-amber-800 border-amber-300' },
  { name: 'アドバンス', level: 'A級', range: '7〜9個', min: 7, max: 9, count: 150, percentage: 15.0, color: 'text-purple-600', barColor: 'bg-purple-500', badgeBg: 'bg-purple-100 text-purple-800 border-purple-300' },
  { name: 'ミドル', level: 'B級', range: '4〜6個', min: 4, max: 6, count: 400, percentage: 40.0, color: 'text-indigo-600', barColor: 'bg-indigo-500', badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { name: 'スタンダード', level: 'C級', range: '1〜3個', min: 1, max: 3, count: 320, percentage: 32.0, color: 'text-blue-600', barColor: 'bg-blue-500', badgeBg: 'bg-blue-100 text-blue-800 border-blue-300' },
  { name: 'エントリー', level: 'D級', range: '0個', min: 0, max: 0, count: 80, percentage: 8.0, color: 'text-slate-500', barColor: 'bg-slate-400', badgeBg: 'bg-slate-100 text-slate-700 border-slate-300' },
];

const WORK_HISTORY: Record<string, MonthData> = {
  '2026-10': {
    monthLabel: '2026年10月度', cumulativeHours: 642, cumulativeSalary: 770400,
    records: [
      { date: '10/01 (木)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
      { date: '10/02 (金)', hours: 8, timeRange: '9:00 - 18:00 (休1h)' },
      { date: '10/05 (月)', hours: 6, timeRange: '10:00 - 17:00 (休1h)' },
      { date: '10/07 (水)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
      { date: '10/08 (木)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
      { date: '10/09 (金)', hours: 5, timeRange: '11:00 - 17:00 (休1h)' },
      { date: '10/12 (月)', hours: 8, timeRange: '9:00 - 18:00 (休1h)' },
    ]
  },
  '2026-09': {
    monthLabel: '2026年9月度', cumulativeHours: 536, cumulativeSalary: 643200,
    records: [
      { date: '09/01 (火)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
      { date: '09/03 (木)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
      { date: '09/04 (金)', hours: 8, timeRange: '9:00 - 18:00 (休1h)' },
      { date: '09/07 (月)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
    ]
  }
};

// ==========================================
// 2. 共通アイコン
// ==========================================
const SvgIcon = ({ path }: { path: string }) => (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path} /></svg>);
const IconEye = () => (<svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
const IconEyeOff = () => (<svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>);
const IconChevronDown = ({ open }: { open: boolean }) => (
  <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const NAV_TABS = [
  { id: 'call', label: '社員呼出', color: 'text-red-600', path: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { id: 'shift', label: 'シフト・給与', color: 'text-indigo-600', path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'likes', label: 'いいね', color: 'text-rose-600', path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { id: 'skills', label: 'スキル/分布', color: 'text-amber-600', path: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
];

// ==========================================
// 3. 高速化：いいね送信フォーム独立コンポーネント
// ==========================================
interface LikeFormProps {
  sentCount: number;
  monthlyLikeLimit: number;
  targetList: Array<{ id: string; name: string }>;
  onSend: (targetId: string, message: string) => void;
}

const FastLikeForm: React.FC<LikeFormProps> = React.memo(({ sentCount, monthlyLikeLimit, targetList, onSend }) => {
  const [selectedTarget, setSelectedTarget] = useState<string>(targetList[0]?.id || '');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(selectedTarget, message);
    setMessage('');
  };

  if (sentCount >= monthlyLikeLimit) {
    return (
      <div className="bg-amber-50 text-amber-700 p-3 rounded-lg text-xs font-medium">
        今月の送信上限数（3件）に達しました。来月また送信できます。
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full">
      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">送信相手</label>
        <select
          value={selectedTarget}
          onChange={(e) => setSelectedTarget(e.target.value)}
          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm focus:border-indigo-500 focus:bg-white"
        >
          {targetList.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600 block mb-1">感謝の一言（送信者のお名前も表示されます）</label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="例: 重い荷物の積み込みを手伝ってくれてありがとうございました！"
          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm focus:border-indigo-500 focus:bg-white"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-rose-500 text-white font-bold py-2.5 rounded-lg text-sm shadow active:scale-95 transition-transform"
      >
        所長へ送信を依頼（いいね +1）
      </button>
    </form>
  );
});

// ==========================================
// 4. アプリケーション本体
// ==========================================
export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('skills');
  const [shiftSubTab, setShiftSubTab] = useState<'submit' | 'history'>('submit');
  
  const [isMoneyVisible, setIsMoneyVisible] = useState<boolean>(false);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState<boolean>(false);
  
  // 社員呼出の永続状態
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [callTargetStaff, setCallTargetStaff] = useState<string>('all');

  // いいね状態
  const [sentCount, setSentCount] = useState<number>(1);
  const [pendingMessages, setPendingMessages] = useState<Array<{ id: number; from: string; to: string; text: string; status: string }>>([
    { id: 1, from: '佐々木 深', to: '堀田 大暉', text: '朝の荷卸し手伝っていただき助かりました！', status: 'approved' }
  ]);
  
  // スキル状態
  const [mySkillStatus, setMySkillStatus] = useState<Record<string, SkillStatus>>({
    '【入荷】入荷照合': 'approved',
    '【棚入】棚入': 'approved',
    '【出荷】ピッキング ＨＴ': 'approved'
  });

  // アコーディオン開閉状態（カテゴリ名をキーとする）
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    '出荷': true, // よく使う出荷業務のみ初期展開
  });
  
  // シフト状態
  const [shiftDates, setShiftDates] = useState<Record<number, number[]>>({});
  const [shiftSubmitted, setShiftSubmitted] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [tempHours, setTempHours] = useState<number[]>([]);
  const HOURS: number[] = [9, 10, 11, 12, 13, 14, 15, 16]; 
  const TOTAL_DAYS = 30;

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  // スキルをカテゴリ別に整理（メモ化）
  const skillCategories = useMemo(() => {
    const map: Record<string, Array<{ full: string; label: string }>> = {};
    SKILL_LIST.forEach((s) => {
      const match = s.match(/【(.*?)】/);
      const cat = match ? match[1] : 'その他';
      const label = s.replace(/【.*?】/, '');
      if (!map[cat]) map[cat] = [];
      map[cat].push({ full: s, label });
    });
    return map;
  }, []);

  // 習得済みスキル数
  const approvedSkillCount = useMemo(() => {
    return Object.values(mySkillStatus).filter(status => status === 'approved').length;
  }, [mySkillStatus]);

  // 自身が属するスキル階層を特定
  const currentTier = useMemo(() => {
    return SKILL_TIERS.find(t => approvedSkillCount >= t.min && approvedSkillCount <= t.max) || SKILL_TIERS[SKILL_TIERS.length - 1];
  }, [approvedSkillCount]);

  // 次の階層への残りスキル数
  const nextTierInfo = useMemo(() => {
    const currentIndex = SKILL_TIERS.findIndex(t => t.name === currentTier.name);
    if (currentIndex > 0) {
      const next = SKILL_TIERS[currentIndex - 1];
      const diff = next.min - approvedSkillCount;
      return { nextName: next.name, nextLevel: next.level, remaining: diff };
    }
    return null; // 既に最上位（マスター）
  }, [currentTier, approvedSkillCount]);

  // シフト計算
  const totalPlannedHours = useMemo(() => {
    return Object.keys(shiftDates).reduce((acc: number, key: string) => {
      const list = shiftDates[Number(key)];
      return acc + (list ? list.length : 0);
    }, 0);
  }, [shiftDates]);

  const totalPlannedSalary = totalPlannedHours * CURRENT_USER.hourlyWage;
  const currentMonthData = WORK_HISTORY[selectedMonth] || { monthLabel: '', cumulativeHours: 0, cumulativeSalary: 0, records: [] };
  const monthlyWorkedHours = currentMonthData.records.reduce((acc: number, r: WorkRecord) => acc + r.hours, 0);
  const monthlySalary = monthlyWorkedHours * CURRENT_USER.hourlyWage;

  const displayMoney = (amount: number) => isMoneyVisible ? `¥${amount.toLocaleString()}` : '¥***,***';
  const isSunday = (day: number) => (day - 1) % 7 === 0;

  // 社員呼出処理（消えずに常時表示へセット）
  const handleCallStaff = (reason: { priority: string; label: string; color: string }) => {
    const targetName = callTargetStaff === 'all' ? '社員全員' : STAFF_LIST.find(s => s.id === callTargetStaff)?.name || '社員';
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    setActiveCall({
      id: Date.now(),
      targetName,
      reasonLabel: reason.label,
      priority: reason.priority,
      color: reason.color,
      calledAt: timeStr,
    });
  };

  // 社員が対応を完了した（または取消）処理
  const handleClearCall = (isResolved: boolean) => {
    setActiveCall(null);
    if (isResolved) {
      alert('社員の対応が完了し、呼出ステータスが解除されました。');
    } else {
      alert('社員呼び出しを取り消しました。');
    }
  };

  // いいね送信処理
  const handleSendLike = (targetId: string, message: string) => {
    if (targetId === CURRENT_USER.id) {
      alert('自分自身には送信できません。');
      return;
    }
    const targetObj = LIKE_TARGET_LIST.find(s => s.id === targetId);
    if (!targetObj) return;

    setPendingMessages(prev => [
      { id: Date.now(), from: CURRENT_USER.name, to: targetObj.name, text: message, status: 'pending' },
      ...prev
    ]);
    setSentCount(prev => prev + 1);
    alert('所長宛てに送信しました。承認後に相手へ届きます。');
  };

  // アコーディオン開閉
  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // スキルステータス変更
  const toggleSkillStatus = (skill: string) => {
    setMySkillStatus(prev => {
      const currentStatus = prev[skill] || 'none';
      let nextStatus: SkillStatus = 'none';
      if (currentStatus === 'none') {
        nextStatus = 'pending';
        alert(`「${skill}」の習得を申請しました。社員の承認をお待ちください。`);
      } else if (currentStatus === 'pending') {
        nextStatus = 'approved';
        alert(`【デモ機能】社員が「${skill}」を承認しました！`);
      } else if (currentStatus === 'approved') {
        nextStatus = 'none';
        alert(`「${skill}」の習得状態を解除しました。`);
      }
      return { ...prev, [skill]: nextStatus };
    });
  };

  // シフトモーダル
  const openShiftModal = (day: number) => { 
    if (isDeadlinePassed || isSunday(day)) return;
    setSelectedDay(day); 
    setTempHours(shiftDates[day] || []); 
  };
  const toggleHour = (h: number) => setTempHours(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h].sort((a, b) => a - b));
  const saveHours = () => { 
    if (selectedDay !== null) setShiftDates({ ...shiftDates, [selectedDay]: tempHours }); 
    setSelectedDay(null); 
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-slate-100 select-none overflow-hidden text-slate-800 relative">
      
      {/* 1時間単位選択モーダル */}
      {selectedDay !== null && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-end sm:items-center justify-center sm:p-4 pb-0">
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-xl p-5 shadow-2xl">
            <h3 className="font-bold text-lg mb-4 text-center text-slate-800">{selectedDay}日 の希望時間</h3>
            <div className="grid grid-cols-2 gap-2 mb-4 w-full">
              {HOURS.map(h => {
                const isSelected = tempHours.includes(h);
                return (
                  <button key={h} onClick={() => toggleHour(h)} className={`py-2 rounded-lg text-xs font-bold border transition-colors ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {h}:00 - {h+1}:00
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between space-x-2 mb-5 w-full">
              <button onClick={() => setTempHours(HOURS)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg text-xs font-bold transition">フル一括 (8h)</button>
              <button onClick={() => setTempHours([])} className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-lg text-xs font-bold border border-slate-200">クリア (休み)</button>
            </div>
            <div className="flex space-x-2.5 w-full">
              <button onClick={() => setSelectedDay(null)} className="flex-1 border-2 border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-bold">キャンセル</button>
              <button onClick={saveHours} className="flex-[2] bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-transform">決定 ({tempHours.length}時間)</button>
            </div>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0 w-full">
        <div>
          <div className="text-xs text-slate-400">{CURRENT_USER.center}</div>
          <div className="text-sm font-bold flex items-center">
            {CURRENT_USER.name} さん 
            <button 
              onClick={() => setIsMoneyVisible(!isMoneyVisible)} 
              className="ml-2 flex items-center text-[11px] font-normal text-slate-300 hover:text-white transition-colors bg-slate-800 px-2 py-0.5 rounded-full"
            >
              時給 {displayMoney(CURRENT_USER.hourlyWage)}
              {isMoneyVisible ? <IconEye /> : <IconEyeOff />}
            </button>
          </div>
        </div>
        <span className="text-xs bg-emerald-600 px-2 py-0.5 rounded-full font-medium">庫内接続中</span>
      </header>
      
      {/* 永続表示：社員呼出中の固定ステータスバナー（全画面に表示） */}
      {activeCall && (
        <div className="bg-red-600 text-white px-4 py-2.5 shadow-md shrink-0 w-full flex items-center justify-between animate-pulse">
          <div className="text-xs font-bold flex items-center space-x-1.5 truncate">
            <span>🚨</span>
            <span className="truncate">【呼出中】{activeCall.targetName} へ [{activeCall.priority}優先] {activeCall.reasonLabel}</span>
          </div>
          <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded shrink-0 ml-2 font-mono">{activeCall.calledAt}発信</span>
        </div>
      )}

      {/* メイン画面 */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 w-full box-border">
        
        {/* 1. 社員呼び出し画面 */}
        {currentTab === 'call' && (
          <div className="w-full space-y-4">
            
            {/* 呼び出し中カード（社員が処理するまで常時表示） */}
            {activeCall ? (
              <div className="w-full bg-red-50 border-2 border-red-400 rounded-xl p-4 shadow-sm box-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-red-700 uppercase tracking-wider flex items-center">
                    <span className="w-2.5 h-2.5 bg-red-600 rounded-full inline-block mr-1.5 animate-ping"></span>
                    社員の対応をお待ちください
                  </span>
                  <span className="text-xs font-mono font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">{activeCall.calledAt} 発信</span>
                </div>
                
                <div className="bg-white p-3 rounded-lg border border-red-200 mb-3 space-y-1">
                  <div className="text-xs text-slate-600">呼び出し宛先：<span className="font-bold text-slate-800">{activeCall.targetName}</span></div>
                  <div className="text-xs text-slate-600">内容：<span className="font-bold text-red-600">[{activeCall.priority}優先] {activeCall.reasonLabel}</span></div>
                </div>

                <p className="text-[11px] text-red-700 leading-tight mb-3">
                  ※社員の社内端末・チャットへ通知が届いています。現場に到着するまでその場でお待ちください。
                </p>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleClearCall(true)}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs shadow active:scale-95 transition"
                  >
                    ✓ 社員が対応完了（解除）
                  </button>
                  <button
                    onClick={() => handleClearCall(false)}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-lg text-xs transition"
                  >
                    誤送信・取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 box-border">
                <h2 className="text-base font-bold text-slate-800 mb-4">社員呼び出し</h2>
                <div className="mb-5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="text-xs font-bold text-slate-600 block mb-2">1. 誰を呼び出しますか？</label>
                  <select value={callTargetStaff} onChange={(e) => setCallTargetStaff(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold text-slate-700 shadow-sm focus:border-indigo-500">
                    <option value="all">社員全員（手が空いている人）</option>
                    {STAFF_LIST.map((s) => (<option key={s.id} value={s.id}>{s.name} ({s.center})</option>))}
                  </select>
                </div>
                <label className="text-xs font-bold text-slate-600 block mb-2">2. トラブル・質問内容（優先度順）</label>
                <div className="grid grid-cols-1 gap-2.5 w-full">
                  {CALL_REASONS.map((r) => (
                    <button key={r.id} onClick={() => handleCallStaff(r)} className={`${r.color} w-full p-4 rounded-xl text-left font-bold shadow active:scale-95 transition-transform flex items-center justify-between box-border`}>
                      <span>{r.label}</span><span className="text-xs bg-black/20 px-2 py-1 rounded shrink-0">優先度: {r.priority}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 box-border">
              💡 ボタンを押すと、社員が対応を完了するまで画面上にステータスが表示され続けます。
            </div>
          </div>
        )}

        {/* 2. シフト提出 ＆ 勤務実績 */}
        {currentTab === 'shift' && (
          <div className="w-full space-y-3">
            <div className="flex bg-slate-200 p-1 rounded-xl w-full box-border">
              <button onClick={() => setShiftSubTab('submit')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${shiftSubTab === 'submit' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>希望提出</button>
              <button onClick={() => setShiftSubTab('history')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${shiftSubTab === 'history' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>実績・給与明細</button>
            </div>

            {shiftSubTab === 'submit' && (
              <div className="space-y-3 w-full">
                <div className={`p-3.5 rounded-xl shadow-sm border box-border ${isDeadlinePassed ? 'bg-rose-50 border-rose-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">【次回シフト提出アナウンス】</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isDeadlinePassed ? 'bg-rose-200 text-rose-900' : 'bg-blue-200 text-blue-900'}`}>
                      {isDeadlinePassed ? '締切終了' : '提出受付中'}
                    </span>
                  </div>
                  <div className="space-y-1 mb-2">
                    <div className="text-xs text-slate-600">対象期間：<span className="text-indigo-900 font-bold">{SHIFT_SCHEDULE.targetWeek}</span></div>
                    <div className="text-xs text-slate-600">提出締切：<span className="text-red-600 font-extrabold text-sm">{SHIFT_SCHEDULE.deadline} まで</span></div>
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-blue-100 pt-1.5 leading-tight">
                    ※毎週水曜日に翌週分の提出を締め切ります。日曜日は定休日のため提出できません。
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white p-4 rounded-xl shadow-md w-full box-border">
                  <div className="text-[11px] text-indigo-200 mb-1">提出希望の予定集計（リアルタイム算出）</div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs text-indigo-200">月間希望時間</div>
                      <div className="text-2xl font-black">{totalPlannedHours} <span className="text-xs font-normal">時間</span></div>
                    </div>
                    <div className="text-right cursor-pointer" onClick={() => setIsMoneyVisible(!isMoneyVisible)}>
                      <div className="text-xs text-indigo-200 flex items-center justify-end">予定支給給与額（概算）{isMoneyVisible ? <IconEye /> : <IconEyeOff />}</div>
                      <div className="text-2xl font-black text-amber-300">{displayMoney(totalPlannedSalary)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 w-full box-border relative">
                  {isDeadlinePassed && (
                    <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
                      <div className="bg-rose-100 text-rose-700 font-bold px-4 py-2 rounded-lg text-sm shadow-sm border border-rose-200">
                        提出締切を過ぎているため操作できません
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-bold text-slate-800">希望シフト選択（1日〜30日）</h2>
                    <span className="text-[10px] text-slate-500">日付をタップして時間を設定</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center mb-4 w-full">
                    {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
                      <span key={d} className={`text-[10px] font-bold py-1 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-500'}`}>{d}</span>
                    ))}
                    {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => {
                      const sunday = isSunday(day);
                      const hoursSelected = shiftDates[day] || [];
                      const isFull = hoursSelected.length === 8;
                      const isPartial = hoursSelected.length > 0 && !isFull;
                      
                      if (sunday) {
                        return (
                          <div key={day} className="h-12 min-w-0 w-full rounded-lg flex flex-col items-center justify-center bg-slate-100/80 border border-slate-200 text-slate-400 cursor-not-allowed opacity-70">
                            <span className="text-xs font-bold leading-tight text-slate-400">{day}</span>
                            <span className="text-[8px] font-bold text-red-400 mt-0.5 scale-95">定休</span>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={day}
                          onClick={() => openShiftModal(day)}
                          disabled={isDeadlinePassed}
                          className={`h-12 min-w-0 w-full rounded-lg flex flex-col items-center justify-center transition-all border ${
                            isDeadlinePassed ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-60' :
                            isFull ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' : 
                            isPartial ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 
                            'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <span className="text-xs font-bold leading-tight">{day}</span>
                          <span className="text-[8px] font-medium leading-none mt-0.5 scale-95">
                            {isFull ? '8h' : isPartial ? `${hoursSelected.length}h` : '-'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={isDeadlinePassed}
                    onClick={() => { setShiftSubmitted(true); alert(`合計 ${totalPlannedHours}時間で希望シフトを提出しました。`); }}
                    className={`w-full font-bold py-3 rounded-xl text-sm shadow-md transition-transform ${
                      isDeadlinePassed ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white active:scale-95'
                    }`}
                  >
                    {isDeadlinePassed ? '締切を過ぎたため提出不可' : shiftSubmitted ? '✓ 提出完了（再提出する）' : 'この内容でシフトを提出する'}
                  </button>
                </div>
                
                <div className="bg-slate-800 p-3 rounded-lg flex items-center justify-between mt-6">
                  <span className="text-xs text-slate-300 font-bold">【デモ】締切日を過ぎた状態にする</span>
                  <input type="checkbox" checked={isDeadlinePassed} onChange={(e) => setIsDeadlinePassed(e.target.checked)} className="w-5 h-5 accent-indigo-500 cursor-pointer" />
                </div>
              </div>
            )}

            {shiftSubTab === 'history' && (
              <div className="space-y-3 w-full">
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-600">表示月度を選択</span>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800">
                    <option value="2026-10">2026年10月度（確定）</option>
                    <option value="2026-09">2026年9月度（確定）</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2.5 w-full">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-bold text-indigo-600 mb-1">【単月】{currentMonthData.monthLabel}</div>
                    <div className="text-xs text-slate-500">勤務時間合計</div>
                    <div className="text-lg font-black text-slate-800">{monthlyWorkedHours} <span className="text-xs font-normal">時間</span></div>
                    <div className="text-xs text-slate-500 mt-2 flex items-center cursor-pointer" onClick={() => setIsMoneyVisible(!isMoneyVisible)}>給与支給額 {isMoneyVisible ? <IconEye /> : <IconEyeOff />}</div>
                    <div className="text-lg font-black text-emerald-600">{displayMoney(monthlySalary)}</div>
                  </div>
                  <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-sm">
                    <div className="text-[10px] font-bold text-amber-400 mb-1">【年間累積】本年度</div>
                    <div className="text-xs text-slate-400">累計勤務時間</div>
                    <div className="text-lg font-black">{currentMonthData.cumulativeHours} <span className="text-xs font-normal">時間</span></div>
                    <div className="text-xs text-slate-400 mt-2 flex items-center cursor-pointer" onClick={() => setIsMoneyVisible(!isMoneyVisible)}>累計支給額 {isMoneyVisible ? <IconEye /> : <IconEyeOff />}</div>
                    <div className="text-lg font-black text-amber-300">{displayMoney(currentMonthData.cumulativeSalary)}</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 w-full box-border">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-slate-700">日別実績（{currentMonthData.records.length}日稼働）</h3>
                    <button onClick={() => setIsMoneyVisible(!isMoneyVisible)} className="text-[10px] flex items-center text-slate-400 border border-slate-200 px-2 py-0.5 rounded bg-slate-50">
                      金額表示 {isMoneyVisible ? <IconEye /> : <IconEyeOff />}
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
                    {currentMonthData.records.map((r, idx) => {
                      const dailyPay = r.hours * CURRENT_USER.hourlyWage;
                      return (
                        <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-slate-800">{r.date}</div>
                            <div className="text-[10px] text-slate-400">{r.timeRange}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-slate-700">{r.hours} 時間</div>
                            <div className="text-[11px] font-bold text-emerald-600">{displayMoney(dailyPay)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. いいね送信画面（高速レンダリング） */}
        {currentTab === 'likes' && (
          <div className="w-full space-y-4">
            <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 box-border">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-bold text-slate-800">サンクスカードを送る</h2>
                <span className="text-xs font-bold text-slate-500">今月: {sentCount} / {CURRENT_USER.monthlyLikeLimit} 件</span>
              </div>
              
              {/* 高速化された独立フォーム */}
              <FastLikeForm
                sentCount={sentCount}
                monthlyLikeLimit={CURRENT_USER.monthlyLikeLimit}
                targetList={LIKE_TARGET_LIST}
                onSend={handleSendLike}
              />
            </div>

            <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 box-border">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">メッセージ履歴・所長承認状態</h3>
              <div className="space-y-2 w-full">
                {pendingMessages.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-50 rounded-lg text-xs border border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-700">{m.from} ➔ {m.to}</span>
                      {m.status === 'approved' ? (<span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">承認済</span>) : (<span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">所長確認中</span>)}
                    </div>
                    <p className="text-slate-600 mt-1">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. 保有スキル（アコーディオン）＆ 全国スキル分布図 */}
        {currentTab === 'skills' && (
          <div className="w-full space-y-4">
            
            {/* スキル登録（カテゴリ別アコーディオン） */}
            <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 box-border">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-base font-bold text-slate-800">保有スキル申請</h2>
                <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                  習得済: {approvedSkillCount} / {SKILL_LIST.length}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mb-4 border-b border-slate-100 pb-2">
                カテゴリをタップして展開します。スキルをタップして申請し、社員承認で「習得済」となります。
              </p>
              
              <div className="space-y-2 w-full">
                {Object.entries(skillCategories).map(([category, items]) => {
                  const isOpen = !!openCategories[category];
                  const categoryApprovedCount = items.filter(i => mySkillStatus[i.full] === 'approved').length;
                  
                  return (
                    <div key={category} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
                      {/* カテゴリヘッダー（タップで開閉） */}
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full px-3 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition-colors text-left"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-800">【{category}】</span>
                          <span className="text-[10px] text-slate-500">{items.length}項目</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            categoryApprovedCount > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {categoryApprovedCount} / {items.length} 習得
                          </span>
                          <IconChevronDown open={isOpen} />
                        </div>
                      </button>

                      {/* アコーディオンの中身 */}
                      {isOpen && (
                        <div className="p-2 space-y-1.5 bg-white border-t border-slate-100">
                          {items.map(({ full, label }) => {
                            const status = mySkillStatus[full] || 'none';
                            let boxStyle, textStyle, badgeStyle, badgeText;
                            if (status === 'approved') {
                              boxStyle = 'bg-indigo-50/80 border-indigo-200';
                              textStyle = 'text-indigo-900 font-bold';
                              badgeStyle = 'bg-indigo-600 text-white';
                              badgeText = '✓ 習得済';
                            } else if (status === 'pending') {
                              boxStyle = 'bg-amber-50 border-amber-300 border-dashed';
                              textStyle = 'text-amber-900 font-bold';
                              badgeStyle = 'bg-amber-500 text-white animate-pulse';
                              badgeText = '⌛ 申請中';
                            } else {
                              boxStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200';
                              textStyle = 'text-slate-600';
                              badgeStyle = 'bg-slate-200 text-slate-500';
                              badgeText = '+ 申請';
                            }

                            return (
                              <div 
                                key={full} 
                                onClick={() => toggleSkillStatus(full)} 
                                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${boxStyle}`}
                              >
                                <span className={`pr-2 break-all leading-tight flex-1 ${textStyle}`}>{label}</span>
                                <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${badgeStyle}`}>
                                  {badgeText}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* 全国1,000人規模のスキル保有分布図 */}
            <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 box-border">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">全国パート社員 スキル分布図（1,000名）</h3>
              </div>
              <p className="text-[10px] text-slate-500 mb-3">
                保有スキル数に応じた全国の階層分布です。
              </p>

              {/* 現在地のサマリーカード */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xl mb-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] text-slate-400">あなたの現在地</span>
                    <div className="text-lg font-black text-amber-300">
                      {currentTier.level} {currentTier.name} クラス
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">習得スキル数</span>
                    <div className="text-lg font-black">{approvedSkillCount} <span className="text-xs font-normal">個</span></div>
                  </div>
                </div>

                {nextTierInfo ? (
                  <div className="text-[11px] bg-slate-800/80 px-2.5 py-1.5 rounded-lg text-slate-300 flex items-center justify-between">
                    <span>次の目標: <strong className="text-white">{nextTierInfo.nextLevel} {nextTierInfo.nextName}</strong></span>
                    <span className="text-indigo-300 font-bold">あと {nextTierInfo.remaining} スキル</span>
                  </div>
                ) : (
                  <div className="text-[11px] bg-amber-900/40 text-amber-200 px-2.5 py-1 rounded text-center font-bold">
                    ★ 最高位のマスタークラスに到達しています！
                  </div>
                )}
              </div>

              {/* 分布バーグラフ一覧 */}
              <div className="space-y-3 w-full">
                {SKILL_TIERS.map((tier) => {
                  const isCurrent = tier.name === currentTier.name;

                  return (
                    <div
                      key={tier.name}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isCurrent 
                          ? 'bg-indigo-50/60 border-indigo-400 shadow-sm ring-1 ring-indigo-400' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${tier.badgeBg}`}>
                            {tier.level}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{tier.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">({tier.range})</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {isCurrent && (
                            <span className="text-[10px] bg-indigo-600 text-white font-black px-1.5 py-0.5 rounded-full animate-bounce">
                              ★ あなた
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-700">{tier.count}名 ({tier.percentage}%)</span>
                        </div>
                      </div>

                      {/* プログレスバー */}
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${tier.barColor}`}
                          style={{ width: `${tier.percentage * 2}%` }} // 最多40%が80%幅になるようスケール調整
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-[10px] text-slate-400 leading-tight border-t border-slate-100 pt-2 text-center">
                ※全拠点のパート社員1,000名の保有スキル登録データをもとにリアルタイム算出しています。
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 固定ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto w-full bg-white/95 backdrop-blur border-t border-slate-200 flex justify-around py-2 shadow-lg z-40">
        {NAV_TABS.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setCurrentTab(tab.id)} className={`flex flex-col items-center p-1 text-xs font-medium transition-colors ${isActive ? `${tab.color} font-bold` : 'text-slate-400'}`}>
              <SvgIcon path={tab.path} /><span className="text-[10px] mt-1">{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
