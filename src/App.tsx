import React, { useState, useMemo, FormEvent } from 'react';

// ==========================================
// 1. 型定義 (TypeScript)
// ==========================================
type UserRole = 'staff' | 'center_admin' | 'super_admin';
type ShiftSubTab = 'submit' | 'history';
type CenterTab = 'shift' | 'skills' | 'likes';
type SuperAdminTab = 'overview' | 'skills' | 'likes';
type SkillStatus = 'none' | 'pending' | 'approved';

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
  barColor: string;
  badgeBg: string;
}

interface CenterSummary {
  id: string;
  name: string;
  region: string;
  staffCount: number;
  submittedCount: number;
  fillRate: number;
  skillRate: number;
  avgSkills: number;
  likeUsageRate: number;
  alert: string | null;
}

interface PendingSkillApproval {
  id: number;
  staffName: string;
  skillName: string;
  appliedAt: string;
}

interface CallReason {
  id: number;
  label: string;
  priority: string;
  color: string;
}

interface PendingMessage {
  id: number;
  center: string;
  from: string;
  to: string;
  text: string;
  status: 'pending' | 'approved';
  sentAt: string;
}

interface SvgIconProps {
  path: string;
}

interface IconChevronDownProps {
  open: boolean;
}

interface FastLikeFormProps {
  sentCount: number;
  monthlyLikeLimit: number;
  targetList: Array<{ id: string; name: string }>;
  onSend: (targetId: string, message: string) => void;
}

interface SkillCategoryItem {
  full: string;
  label: string;
}

interface NextTierInfo {
  nextName: string;
  nextLevel: string;
  remaining: number;
}

// ==========================================
// 2. 全国19センターのマスターデータ (計1,029名)
// ==========================================
const CENTERS_DATA: CenterSummary[] = [
  { id: 'c150',  name: '千歳',    region: '北海道', staffCount: 30,  submittedCount: 28,  fillRate: 93, skillRate: 68, avgSkills: 4.8, likeUsageRate: 85, alert: null },
  { id: 'c210',  name: '青森',    region: '東北',   staffCount: 9,   submittedCount: 8,   fillRate: 89, skillRate: 72, avgSkills: 5.1, likeUsageRate: 90, alert: null },
  { id: 'c440',  name: '宮城',    region: '東北',   staffCount: 31,  submittedCount: 29,  fillRate: 94, skillRate: 65, avgSkills: 4.5, likeUsageRate: 78, alert: null },
  { id: 'c510',  name: '秋田',    region: '東北',   staffCount: 13,  submittedCount: 12,  fillRate: 92, skillRate: 59, avgSkills: 4.0, likeUsageRate: 70, alert: null },
  { id: 'c710',  name: '郡山',    region: '東北',   staffCount: 18,  submittedCount: 16,  fillRate: 89, skillRate: 61, avgSkills: 4.2, likeUsageRate: 75, alert: null },
  { id: 'c920',  name: '佐野',    region: '関東',   staffCount: 100, submittedCount: 92,  fillRate: 92, skillRate: 74, avgSkills: 5.3, likeUsageRate: 88, alert: null },
  { id: 'c1170', name: '入間',    region: '関東',   staffCount: 114, submittedCount: 105, fillRate: 92, skillRate: 70, avgSkills: 4.9, likeUsageRate: 82, alert: null },
  { id: 'c1210', name: '千葉',    region: '関東',   staffCount: 65,  submittedCount: 48,  fillRate: 74, skillRate: 48, avgSkills: 3.2, likeUsageRate: 55, alert: 'フォーク乗務不足' },
  { id: 'c1410', name: '伊勢原',  region: '関東',   staffCount: 153, submittedCount: 142, fillRate: 93, skillRate: 76, avgSkills: 5.6, likeUsageRate: 91, alert: null },
  { id: 'c1510', name: '新潟',    region: '甲信越', staffCount: 20,  submittedCount: 19,  fillRate: 95, skillRate: 66, avgSkills: 4.6, likeUsageRate: 80, alert: null },
  { id: 'c1710', name: '金沢',    region: '北陸',   staffCount: 9,   submittedCount: 8,   fillRate: 89, skillRate: 70, avgSkills: 4.7, likeUsageRate: 85, alert: null },
  { id: 'c2030', name: '長野',    region: '甲信越', staffCount: 25,  submittedCount: 23,  fillRate: 92, skillRate: 64, avgSkills: 4.3, likeUsageRate: 76, alert: null },
  { id: 'c2410', name: '四日市',  region: '東海',   staffCount: 75,  submittedCount: 70,  fillRate: 93, skillRate: 71, avgSkills: 5.0, likeUsageRate: 84, alert: null },
  { id: 'c2710', name: '大阪',    region: '関西',   staffCount: 34,  submittedCount: 31,  fillRate: 91, skillRate: 69, avgSkills: 4.8, likeUsageRate: 82, alert: null },
  { id: 'c2760', name: '岸和田',  region: '関西',   staffCount: 118, submittedCount: 82,  fillRate: 69, skillRate: 52, avgSkills: 3.5, likeUsageRate: 60, alert: '出庫人員不足' },
  { id: 'c3410', name: '広島',    region: '中国',   staffCount: 22,  submittedCount: 20,  fillRate: 91, skillRate: 67, avgSkills: 4.6, likeUsageRate: 81, alert: null },
  { id: 'c3730', name: 'さぬき',  region: '四国',   staffCount: 25,  submittedCount: 23,  fillRate: 92, skillRate: 63, avgSkills: 4.4, likeUsageRate: 75, alert: null },
  { id: 'c4010', name: '朝倉',    region: '九州',   staffCount: 145, submittedCount: 133, fillRate: 92, skillRate: 75, avgSkills: 5.4, likeUsageRate: 89, alert: null },
  { id: 'c4610', name: '鹿児島',  region: '九州',   staffCount: 23,  submittedCount: 21,  fillRate: 91, skillRate: 66, avgSkills: 4.5, likeUsageRate: 79, alert: null },
];

const CALL_REASONS: CallReason[] = [
  { id: 1, label: '【緊急】 怪我・トラブル', priority: '高', color: 'bg-red-500 text-white' },
  { id: 2, label: '【優先】 機器不良', priority: '中', color: 'bg-amber-500 text-white' },
  { id: 3, label: '【確認】 在庫確認', priority: '低', color: 'bg-blue-500 text-white' },
  { id: 4, label: '【相談】 その他', priority: '低', color: 'bg-slate-600 text-white' },
];

const SKILL_LIST: string[] = [
  '【発注】入力業務', '【発注】新発注補助Ｓ操作', '【発注】直送発注', '【発注】移動対応',
  '【入荷】入荷照合', '【棚入】棚入', '【棚入】棚番メンテナンス', '【棚入】セット組み・得意先依頼加工',
  '【出荷】受注引当（集計）', '【出荷】ピッキング ＨＴ', '【出荷】ピッキングリスト', '【出荷】ケースラベル',
  '【出荷】不定形 ＨＴ', '【返品】店返品作業', '【返品】店返品棚戻', '【返品】仕入れ返品作業',
  '【棚卸】カウント', '【事務業務】仕入', '【事務業務】売上', '【事務業務】出荷事務', '【その他】フォークリフト乗務',
];

const CURRENT_USER = {
  id: 'user_182',
  name: '佐々木 深',
  center: '伊勢原',
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

const SKILL_TIERS: SkillTier[] = [
  { name: 'マスター', level: 'S級', range: '18個以上', min: 18, max: 21, count: 52, percentage: 5.1, barColor: 'bg-amber-500', badgeBg: 'bg-amber-100 text-amber-800 border-amber-300' },
  { name: 'プロ', level: 'A級', range: '14〜17個', min: 14, max: 17, count: 160, percentage: 15.5, barColor: 'bg-purple-500', badgeBg: 'bg-purple-100 text-purple-800 border-purple-300' },
  { name: 'アドバンス', level: 'B級', range: '10〜13個', min: 10, max: 13, count: 415, percentage: 40.3, barColor: 'bg-indigo-500', badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { name: 'スタンダード', level: 'C級', range: '6〜9個', min: 6, max: 9, count: 322, percentage: 31.3, barColor: 'bg-blue-500', badgeBg: 'bg-blue-100 text-blue-800 border-blue-300' },
  { name: 'エントリー', level: 'D級', range: '0～5個', min: 0, max: 5, count: 80, percentage: 7.8, barColor: 'bg-slate-400', badgeBg: 'bg-slate-100 text-slate-700 border-slate-300' },
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
      { date: '10/14 (水)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
      { date: '10/16 (金)', hours: 8, timeRange: '9:00 - 18:00 (休1h)' },
    ]
  },
  '2026-09': {
    monthLabel: '2026年9月度', cumulativeHours: 579, cumulativeSalary: 694800,
    records: [
      { date: '09/01 (火)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
      { date: '09/03 (木)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
      { date: '09/04 (金)', hours: 8, timeRange: '9:00 - 18:00 (休1h)' },
      { date: '09/07 (月)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
      { date: '09/10 (木)', hours: 8, timeRange: '9:00 - 18:00 (休1h)' },
      { date: '09/15 (火)', hours: 6, timeRange: '10:00 - 17:00 (休1h)' },
    ]
  },
  '2026-08': {
    monthLabel: '2026年8月度', cumulativeHours: 512, cumulativeSalary: 614400,
    records: [
      { date: '08/03 (月)', hours: 8, timeRange: '9:00 - 18:00 (休1h)' },
      { date: '08/05 (水)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
      { date: '08/07 (金)', hours: 8, timeRange: '9:00 - 18:00 (休1h)' },
      { date: '08/17 (月)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
      { date: '08/20 (木)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
    ]
  },
  '2026-07': {
    monthLabel: '2026年7月度', cumulativeHours: 445, cumulativeSalary: 534000,
    records: [
      { date: '07/02 (木)', hours: 8, timeRange: '9:00 - 18:00 (休1h)' },
      { date: '07/06 (月)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
      { date: '07/09 (木)', hours: 8, timeRange: '9:00 - 18:00 (休1h)' },
      { date: '07/15 (水)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
    ]
  },
  '2026-06': {
    monthLabel: '2026年6月度', cumulativeHours: 375, cumulativeSalary: 450000,
    records: [
      { date: '06/03 (水)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
      { date: '06/05 (金)', hours: 8, timeRange: '9:00 - 18:00 (休1h)' },
      { date: '06/10 (水)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
    ]
  },
  '2026-05': {
    monthLabel: '2026年5月度', cumulativeHours: 310, cumulativeSalary: 372000,
    records: [
      { date: '05/08 (金)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
      { date: '05/12 (火)', hours: 8, timeRange: '9:00 - 18:00 (休1h)' },
      { date: '05/15 (金)', hours: 7, timeRange: '9:00 - 17:00 (休1h)' },
    ]
  }
};

// ==========================================
// 3. 共通コンポーネント
// ==========================================
const SvgIcon: React.FC<SvgIconProps> = ({ path }) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
  </svg>
);

const IconEye: React.FC = () => (
  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const IconEyeOff: React.FC = () => (
  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const IconChevronDown: React.FC<IconChevronDownProps> = ({ open }) => (
  <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const NAV_TABS = [
  { id: 'call', label: '社員呼出', color: 'text-red-600', path: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { id: 'shift', label: 'シフト・給与', color: 'text-indigo-600', path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'likes', label: 'いいね', color: 'text-rose-600', path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { id: 'skills', label: 'スキル/分布', color: 'text-amber-600', path: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
];

const FastLikeForm: React.FC<FastLikeFormProps> = ({ sentCount, monthlyLikeLimit, targetList, onSend }) => {
  const [selectedTarget, setSelectedTarget] = useState<string>(targetList[0]?.id || '');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
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
};

// ==========================================
// 4. アプリケーション本体
// ==========================================
export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('staff');
  const [currentTab, setCurrentTab] = useState<string>('shift');
  const [shiftSubTab, setShiftSubTab] = useState<ShiftSubTab>('submit');
  const [centerTab, setCenterTab] = useState<CenterTab>('shift');
  const [superAdminTab, setSuperAdminTab] = useState<SuperAdminTab>('overview');
  
  const [isMoneyVisible, setIsMoneyVisible] = useState<boolean>(false);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState<boolean>(false);
  
  const [activeCall, setActiveCall] = useState<ActiveCall | null>({
    id: 1,
    targetName: '木村裕一 所長',
    reasonLabel: '【優先】 機器不良',
    priority: '中',
    color: 'bg-amber-500 text-white',
    calledAt: '14:20',
  });
  const [callTargetStaff, setCallTargetStaff] = useState<string>('all');

  const [sentCount, setSentCount] = useState<number>(1);
  
  const [allMessages, setAllMessages] = useState<PendingMessage[]>([
    { id: 1, center: '伊勢原', from: '佐々木 深', to: '堀田 大暉', text: '朝の荷卸し手伝っていただき助かりました！', status: 'approved', sentAt: '10/29 08:45' },
    { id: 2, center: '伊勢原', from: '奥山 政幸', to: '湯谷 杏吏', text: 'ピッキングの棚番フォロー感謝です！', status: 'approved', sentAt: '10/29 11:20' },
    { id: 3, center: '佐野', from: '佐藤 健', to: '高橋 涼介', text: 'フォークリフトの荷受けを素早く代わってくれて助かりました。', status: 'approved', sentAt: '10/29 14:10' },
    { id: 4, center: '朝倉', from: '田中 優子', to: '原田 翔太', text: '新発注システムの操作を優しく教えていただきありがとうございました。', status: 'approved', sentAt: '10/29 16:30' },
    { id: 5, center: '千歳', from: '工藤 雄大', to: '三浦 健太', text: '低温庫の防寒手袋を準備してくれてありがとうございます！', status: 'approved', sentAt: '10/30 09:15' },
    { id: 6, center: '伊勢原', from: '佐々木 深', to: '中田 有祐', text: '検品作業の最終確認ダブルチェック助かりました！', status: 'pending', sentAt: '10/30 11:00' },
  ]);
  
  const [mySkillStatus, setMySkillStatus] = useState<Record<string, SkillStatus>>({
    '【入荷】入荷照合': 'approved',
    '【棚入】棚入': 'approved',
    '【出荷】ピッキング ＨＴ': 'approved'
  });

  const [pendingSkillApprovals, setPendingSkillApprovals] = useState<PendingSkillApproval[]>([
    { id: 101, staffName: '佐々木 深', skillName: '【その他】フォークリフト乗務', appliedAt: '昨日 17:30' },
    { id: 102, staffName: '奥山 政幸', skillName: '【出荷】受注引当（集計）', appliedAt: '本日 09:15' },
    { id: 103, staffName: '菅田 真啓', skillName: '【棚入】棚番メンテナンス', appliedAt: '本日 11:40' },
  ]);

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ '出荷': true });
  
  const [shiftDates, setShiftDates] = useState<Record<number, number[]>>({});
  const [shiftSubmitted, setShiftSubmitted] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [tempHours, setTempHours] = useState<number[]>([]);
  const HOURS: number[] = [9, 10, 11, 12, 13, 14, 15, 16]; 
  const TOTAL_DAYS = 30;

  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  const skillCategories: Record<string, SkillCategoryItem[]> = useMemo(() => {
    const map: Record<string, SkillCategoryItem[]> = {};
    SKILL_LIST.forEach((s) => {
      const match = s.match(/【(.*?)】/);
      const cat = match ? match[1] : 'その他';
      const label = s.replace(/【.*?】/, '');
      if (!map[cat]) {
        map[cat] = [];
      }
      map[cat].push({ full: s, label });
    });
    return map;
  }, []);

  const approvedSkillCount = useMemo(() => {
    return Object.values(mySkillStatus).filter(status => status === 'approved').length;
  }, [mySkillStatus]);

  const currentTier = useMemo(() => {
    const found = SKILL_TIERS.find(t => approvedSkillCount >= t.min && approvedSkillCount <= t.max);
    return found ? found : SKILL_TIERS[SKILL_TIERS.length - 1];
  }, [approvedSkillCount]);

  const nextTierInfo = useMemo<NextTierInfo | null>(() => {
    const currentIndex = SKILL_TIERS.findIndex(t => t.name === currentTier.name);
    if (currentIndex > 0) {
      const next = SKILL_TIERS[currentIndex - 1];
      const diff = next.min - approvedSkillCount;
      return { nextName: next.name, nextLevel: next.level, remaining: diff };
    }
    return null;
  }, [currentTier, approvedSkillCount]);

  const totalPlannedHours = useMemo(() => {
    let total = 0;
    const keys = Object.keys(shiftDates);
    for (let i = 0; i < keys.length; i++) {
      const dayStr = keys[i];
      const dayNum = parseInt(dayStr, 10);
      if (!isNaN(dayNum)) {
        const list = shiftDates[dayNum];
        if (Array.isArray(list)) {
          total += list.length;
        }
      }
    }
    return total;
  }, [shiftDates]);

  const totalPlannedSalary = totalPlannedHours * CURRENT_USER.hourlyWage;
  
  const currentMonthData = useMemo(() => {
    return WORK_HISTORY[selectedMonth] || { monthLabel: '', cumulativeHours: 0, cumulativeSalary: 0, records: [] };
  }, [selectedMonth]);

  const monthlyWorkedHours = useMemo(() => {
    return currentMonthData.records.reduce((acc, r) => acc + r.hours, 0);
  }, [currentMonthData]);

  const monthlySalary = monthlyWorkedHours * CURRENT_USER.hourlyWage;

  const displayMoney = (amount: number) => isMoneyVisible ? `¥${amount.toLocaleString()}` : '¥***,***';
  const isSunday = (day: number) => (day - 1) % 7 === 0;

  const handleCallStaff = (reason: CallReason) => {
    const targetName = callTargetStaff === 'all' ? '社員全員' : (STAFF_LIST.find(s => s.id === callTargetStaff)?.name || '社員');
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

  const handleClearCall = (isResolved: boolean) => {
    setActiveCall(null);
    alert(isResolved ? '社員の対応が完了し、解除されました。' : '呼び出しを取り消しました。');
  };

  const handleSendLike = (targetId: string, message: string) => {
    if (targetId === CURRENT_USER.id) {
      alert('自分自身には送信できません。');
      return;
    }
    const targetObj = LIKE_TARGET_LIST.find(s => s.id === targetId);
    if (!targetObj) return;

    const newMessage: PendingMessage = { 
      id: Date.now(),
      center: '伊勢原',
      from: CURRENT_USER.name, 
      to: targetObj.name, 
      text: message, 
      status: 'pending',
      sentAt: '本日 17:35'
    };

    setAllMessages(prev => [newMessage, ...prev]);
    setSentCount(prev => prev + 1);
    alert('所長宛てに送信しました。承認後に相手へ届きます。');
  };

  const handleApproveSkill = (id: number, approve: boolean) => {
    setPendingSkillApprovals(prev => prev.filter(item => item.id !== id));
    alert(approve ? 'スキル習得を承認しました。パートの保有スキルに反映されます。' : '申請を差戻しました。');
  };

  const handleApproveLike = (id: number) => {
    setAllMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'approved' } : m));
    alert('サンクスカードを承認しました。相手のスマホへ通知が配信されます。');
  };

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleSkillStatus = (skill: string) => {
    setMySkillStatus(prev => {
      const currentStatus = prev[skill] || 'none';
      let nextStatus: SkillStatus = 'none';
      if (currentStatus === 'none') {
        nextStatus = 'pending';
        alert(`「${skill}」の習得を申請しました。所長の承認をお待ちください。`);
      } else if (currentStatus === 'pending') {
        nextStatus = 'approved';
        alert(`【デモ機能】所長が「${skill}」を承認しました！`);
      } else if (currentStatus === 'approved') {
        nextStatus = 'none';
        alert(`「${skill}」の習得状態を解除しました。`);
      }
      return { ...prev, [skill]: nextStatus };
    });
  };

  const openShiftModal = (day: number) => { 
    if (isDeadlinePassed || isSunday(day)) return;
    setSelectedDay(day); 
    setTempHours(shiftDates[day] || []); 
  };
  const toggleHour = (h: number) => {
    setTempHours(prev => {
      if (prev.includes(h)) {
        return prev.filter(x => x !== h);
      }
      return [...prev, h].sort((a, b) => a - b);
    });
  };
  const saveHours = () => { 
    if (selectedDay !== null) {
      setShiftDates(prev => ({ ...prev, [selectedDay]: tempHours }));
    }
    setSelectedDay(null); 
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-slate-100 select-none overflow-hidden text-slate-800 relative">
      
      {/* 視点切替バー */}
      <div className="bg-slate-950 text-white px-2 py-1.5 shrink-0 w-full border-b border-slate-800 z-50">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-bold ml-1">視点切替:</span>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentRole('staff')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                currentRole === 'staff' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              👤 パート
            </button>
            <button
              onClick={() => setCurrentRole('center_admin')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                currentRole === 'center_admin' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🏢 所長 (伊勢原)
            </button>
            <button
              onClick={() => setCurrentRole('super_admin')}
              className={`px-2 py-1 rounded font-bold transition-all ${
                currentRole === 'super_admin' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🌐 本部 (19拠点)
            </button>
          </div>
        </div>
      </div>

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
              <button onClick={() => setTempHours([...HOURS])} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-lg text-xs font-bold transition">フル一括 (8h)</button>
              <button onClick={() => setTempHours([])} className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-lg text-xs font-bold border border-slate-200">クリア (休み)</button>
            </div>
            <div className="flex space-x-2.5 w-full">
              <button onClick={() => setSelectedDay(null)} className="flex-1 border-2 border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-bold">キャンセル</button>
              <button onClick={saveHours} className="flex-[2] bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-transform">決定 ({tempHours.length}時間)</button>
            </div>
          </div>
        </div>
      )}

      {/* 画面1：パート画面 */}
      {currentRole === 'staff' && (
        <>
          <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0 w-full">
            <div>
              <div className="text-xs text-slate-400">{CURRENT_USER.center}センター</div>
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
            <span className="text-xs bg-emerald-600 px-2 py-0.5 rounded-full font-medium">個人ページ</span>
          </header>
          
          {activeCall && (
            <div className="bg-red-600 text-white px-4 py-2.5 shadow-md shrink-0 w-full flex items-center justify-between animate-pulse">
              <div className="text-xs font-bold flex items-center space-x-1.5 truncate">
                <span role="img" aria-label="alert">🚨</span>
                <span className="truncate">【呼出中】{activeCall.targetName} へ [{activeCall.priority}優先] {activeCall.reasonLabel}</span>
              </div>
              <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded shrink-0 ml-2 font-mono">{activeCall.calledAt}発信</span>
            </div>
          )}

          <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 w-full box-border">
            {currentTab === 'call' && (
              <div className="w-full space-y-4">
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
                    <div className="flex space-x-2">
                      <button onClick={() => handleClearCall(true)} className="flex-[2] bg-emerald-600 text-white font-bold py-2.5 rounded-lg text-xs shadow">✓ 社員が対応完了（解除）</button>
                      <button onClick={() => handleClearCall(false)} className="flex-1 bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-xs">取消</button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 box-border">
                    <h2 className="text-base font-bold text-slate-800 mb-4">社員呼び出し</h2>
                    <div className="mb-5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <label className="text-xs font-bold text-slate-600 block mb-2">1. 誰を呼び出しますか？</label>
                      <select value={callTargetStaff} onChange={(e) => setCallTargetStaff(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg p-2 text-sm font-bold text-slate-700 shadow-sm">
                        <option value="all">社員全員（手が空いている人）</option>
                        {STAFF_LIST.map((s) => (<option key={s.id} value={s.id}>{s.name} ({s.center})</option>))}
                      </select>
                    </div>
                    <label className="text-xs font-bold text-slate-600 block mb-2">2. トラブル・質問内容（優先度順）</label>
                    <div className="grid grid-cols-1 gap-2.5 w-full">
                      {CALL_REASONS.map((r) => (
                        <button key={r.id} onClick={() => handleCallStaff(r)} className={`${r.color} w-full p-4 rounded-xl text-left font-bold shadow flex items-center justify-between box-border`}>
                          <span>{r.label}</span><span className="text-xs bg-black/20 px-2 py-1 rounded shrink-0">優先度: {r.priority}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentTab === 'shift' && (
              <div className="w-full space-y-3">
                <div className="flex bg-slate-200 p-1 rounded-xl w-full box-border">
                  <button onClick={() => setShiftSubTab('submit')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${shiftSubTab === 'submit' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>希望提出</button>
                  <button onClick={() => setShiftSubTab('history')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${shiftSubTab === 'history' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>全月度 勤務実績</button>
                </div>

                {shiftSubTab === 'submit' && (
                  <div className="space-y-3 w-full">
                    <div className={`p-3.5 rounded-xl shadow-sm border box-border ${isDeadlinePassed ? 'bg-rose-50 border-rose-200' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-700">【次回シフト提出アナウンス】</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isDeadlinePassed ? 'bg-rose-200 text-rose-900' : 'bg-blue-200 text-blue-900'}`}>{isDeadlinePassed ? '締切終了' : '提出受付中'}</span>
                      </div>
                      <div className="text-xs text-slate-600 mb-1">対象期間：<span className="text-indigo-900 font-bold">{SHIFT_SCHEDULE.targetWeek}</span></div>
                      <div className="text-xs text-slate-600">提出締切：<span className="text-red-600 font-extrabold text-sm">{SHIFT_SCHEDULE.deadline} まで</span></div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white p-4 rounded-xl shadow-md w-full box-border">
                      <div className="text-[11px] text-indigo-200 mb-1">提出希望の予定集計（リアルタイム算出）</div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-xs text-indigo-200">月間希望時間</div>
                          <div className="text-2xl font-black">{totalPlannedHours} <span className="text-xs font-normal">時間</span></div>
                        </div>
                        <div className="text-right cursor-pointer" onClick={() => setIsMoneyVisible(!isMoneyVisible)}>
                          <div className="text-xs text-indigo-200 flex items-center justify-end">予定給与額 {isMoneyVisible ? <IconEye /> : <IconEyeOff />}</div>
                          <div className="text-2xl font-black text-amber-300">{displayMoney(totalPlannedSalary)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 w-full box-border">
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
                                isFull ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm' : 
                                isPartial ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 
                                'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <span className="text-xs font-bold leading-tight">{day}</span>
                              <span className="text-[8px] font-medium leading-none mt-0.5 scale-95">{isFull ? '8h' : isPartial ? `${hoursSelected.length}h` : '-'}</span>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => { setShiftSubmitted(true); alert(`合計 ${totalPlannedHours}時間で希望シフトを提出しました。`); }}
                        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm shadow-md active:scale-95 transition-transform"
                      >
                        {shiftSubmitted ? '✓ 提出完了（再提出する）' : 'この内容でシフトを提出する'}
                      </button>
                    </div>
                  </div>
                )}

                {/* 個人画面：全月度 勤務実績 */}
                {shiftSubTab === 'history' && (
                  <div className="space-y-3 w-full">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                      <span className="text-xs font-bold text-slate-700">表示月度を選択（全履歴）</span>
                      <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)} 
                        className="bg-indigo-50 border border-indigo-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-indigo-900 focus:outline-none"
                      >
                        {Object.keys(WORK_HISTORY).map((mKey) => (
                          <option key={mKey} value={mKey}>
                            {WORK_HISTORY[mKey].monthLabel}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 w-full">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-[10px] font-bold text-indigo-600 mb-1">【単月】{currentMonthData.monthLabel}</div>
                        <div className="text-xs text-slate-500">勤務時間合計</div>
                        <div className="text-lg font-black text-slate-800">{monthlyWorkedHours} <span className="text-xs font-normal">時間</span></div>
                        <div className="text-xs text-slate-500 mt-2 flex items-center cursor-pointer" onClick={() => setIsMoneyVisible(!isMoneyVisible)}>
                          給与支給額 {isMoneyVisible ? <IconEye /> : <IconEyeOff />}
                        </div>
                        <div className="text-lg font-black text-emerald-600">{displayMoney(monthlySalary)}</div>
                      </div>
                      <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 shadow-sm">
                        <div className="text-[10px] font-bold text-amber-400 mb-1">【年間累積】</div>
                        <div className="text-xs text-slate-400">累計勤務時間</div>
                        <div className="text-lg font-black">{currentMonthData.cumulativeHours} <span className="text-xs font-normal">時間</span></div>
                        <div className="text-xs text-slate-400 mt-2 flex items-center cursor-pointer" onClick={() => setIsMoneyVisible(!isMoneyVisible)}>
                          累計支給額 {isMoneyVisible ? <IconEye /> : <IconEyeOff />}
                        </div>
                        <div className="text-lg font-black text-amber-300">{displayMoney(currentMonthData.cumulativeSalary)}</div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 w-full box-border">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-slate-700">日別実績明細（{currentMonthData.records.length}日稼働）</h3>
                        <button onClick={() => setIsMoneyVisible(!isMoneyVisible)} className="text-[10px] flex items-center text-slate-400 border border-slate-200 px-2 py-0.5 rounded bg-slate-50">
                          金額表示 {isMoneyVisible ? <IconEye /> : <IconEyeOff />}
                        </button>
                      </div>
                      <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
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

            {currentTab === 'likes' && (
              <div className="w-full space-y-4">
                <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 box-border">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-base font-bold text-slate-800">サンクスカードを送る</h2>
                    <span className="text-xs font-bold text-slate-500">今月: {sentCount} / {CURRENT_USER.monthlyLikeLimit} 件</span>
                  </div>
                  <FastLikeForm sentCount={sentCount} monthlyLikeLimit={CURRENT_USER.monthlyLikeLimit} targetList={LIKE_TARGET_LIST} onSend={handleSendLike} />
                </div>
              </div>
            )}

            {currentTab === 'skills' && (
              <div className="w-full space-y-4">
                <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 box-border">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-base font-bold text-slate-800">保有スキル申請</h2>
                    {/* ★「何分の何 習得済」の表示に変更 */}
                    <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                      {approvedSkillCount} / {SKILL_LIST.length} 習得済
                    </span>
                  </div>
                  <div className="space-y-2 w-full">
                    {Object.keys(skillCategories).map((category) => {
                      const items = skillCategories[category];
                      const isOpen = Boolean(openCategories[category]);
                      return (
                        <div key={category} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <button onClick={() => toggleCategory(category)} className="w-full px-3 py-2 bg-slate-50 flex items-center justify-between text-left">
                            <span className="font-bold text-xs text-slate-800">【{category}】 ({items.length})</span>
                            <IconChevronDown open={isOpen} />
                          </button>
                          {isOpen && (
                            <div className="p-2 space-y-1.5 border-t border-slate-100">
                              {items.map(({ full, label }) => {
                                const status = mySkillStatus[full] || 'none';
                                return (
                                  <div key={full} onClick={() => toggleSkillStatus(full)} className="p-2 rounded border text-xs flex items-center justify-between cursor-pointer bg-slate-50">
                                    <span>{label}</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200">{status === 'approved' ? '✓ 習得済' : status === 'pending' ? '⌛ 申請中' : '+ 申請'}</span>
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

                <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 box-border">
                  <h3 className="text-xs font-bold text-slate-800 mb-2">全国パート社員 スキル分布図（1,029名）</h3>
                  <div className="bg-slate-900 text-white p-3 rounded-xl mb-3 flex justify-between items-center">
                    <div>
                      <div className="text-[10px] text-slate-400">現在地</div>
                      <div className="text-base font-black text-amber-300">{currentTier.level} {currentTier.name}</div>
                    </div>
                    {nextTierInfo && <div className="text-xs text-indigo-300">次まであと {nextTierInfo.remaining} 個</div>}
                  </div>

                  <div className="space-y-2.5">
                    {SKILL_TIERS.map((tier) => {
                      const isCurrent = tier.name === currentTier.name;
                      return (
                        <div key={tier.name} className={`p-2 rounded-lg border ${isCurrent ? 'bg-indigo-50 border-indigo-400' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold text-slate-800">{tier.level} {tier.name} ({tier.range})</span>
                            <span className="text-slate-600 font-bold">{tier.count}名 ({tier.percentage}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className={`h-full ${tier.barColor}`} style={{ width: `${tier.percentage * 2}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </main>

          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto w-full bg-white/95 backdrop-blur border-t border-slate-200 flex justify-around py-2 shadow-lg z-40">
            {NAV_TABS.map((tab) => (
              <button key={tab.id} onClick={() => setCurrentTab(tab.id)} className={`flex flex-col items-center p-1 text-xs font-medium ${currentTab === tab.id ? `${tab.color} font-bold` : 'text-slate-400'}`}>
                <SvgIcon path={tab.path} /><span className="text-[10px] mt-1">{tab.label}</span>
              </button>
            ))}
          </nav>
        </>
      )}

      {/* 画面2：所長画面 */}
      {currentRole === 'center_admin' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-12 w-full box-border">
          <div className="bg-amber-600 text-white p-4 rounded-2xl shadow-md mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs bg-black/20 px-2 py-0.5 rounded font-bold">拠点長ダッシュボード</span>
              <span className="text-xs font-mono">管理者: 木村 裕一 所長</span>
            </div>
            <h1 className="text-lg font-black">伊勢原センター 管理画面</h1>
            <p className="text-xs text-amber-100 mt-1">自センター在籍: 153名 （他センターのデータはアクセス不可）</p>
          </div>

          <div className="flex bg-slate-200 p-1 rounded-xl mb-4 w-full">
            <button onClick={() => setCenterTab('shift')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${centerTab === 'shift' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600'}`}>シフト集計</button>
            <button onClick={() => setCenterTab('skills')} className={`flex-1 py-2 text-xs font-bold rounded-lg relative ${centerTab === 'skills' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600'}`}>
              スキル承認
              {pendingSkillApprovals.length > 0 && <span className="ml-1 bg-red-500 text-white px-1.5 py-0.2 rounded-full text-[9px]">{pendingSkillApprovals.length}</span>}
            </button>
            <button onClick={() => setCenterTab('likes')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${centerTab === 'likes' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600'}`}>カード承認</button>
          </div>

          {centerTab === 'shift' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm text-slate-800">翌週シフト提出状況</h3>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">充足率: 93%</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block">提出済み</span>
                    <span className="text-xl font-black text-indigo-600">142 <span className="text-xs font-normal text-slate-600">/ 153名</span></span>
                  </div>
                  <div className="bg-rose-50 p-3 rounded-lg border border-rose-200 text-center">
                    <span className="text-[10px] text-rose-600 block">未提出者</span>
                    <span className="text-xl font-black text-rose-600">11 <span className="text-xs font-normal text-slate-600">名</span></span>
                  </div>
                </div>

                <button 
                  onClick={() => alert('伊勢原センター（153名）専用のシフト集計Excelファイルをダウンロードしました。')}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1 shadow"
                >
                  <span>📊 伊勢原センター専用Excel出力 (ヒートマップ付き)</span>
                </button>
              </div>
            </div>
          )}

          {centerTab === 'skills' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-2">パートからのスキル習得申請一覧</h3>
                {pendingSkillApprovals.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">承認待ちのスキル申請はありません。</div>
                ) : (
                  <div className="space-y-2.5">
                    {pendingSkillApprovals.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800">{item.staffName} さん</span>
                          <span className="text-[10px] text-slate-400">{item.appliedAt}</span>
                        </div>
                        <div className="text-indigo-900 font-bold mb-2">申請: {item.skillName}</div>
                        <div className="flex space-x-2">
                          <button onClick={() => handleApproveSkill(item.id, true)} className="flex-1 bg-indigo-600 text-white font-bold py-1.5 rounded text-xs shadow">✓ 承認する</button>
                          <button onClick={() => handleApproveSkill(item.id, false)} className="flex-1 bg-slate-200 text-slate-600 font-bold py-1.5 rounded text-xs">差戻し</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {centerTab === 'likes' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-sm text-slate-800 mb-2">サンクスカード承認（所長検閲）</h3>
              <div className="space-y-2">
                {allMessages.filter(m => m.center === '伊勢原' && m.status === 'pending').map((m) => (
                  <div key={m.id} className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
                    <div className="font-bold text-slate-700 mb-1">{m.from} ➔ {m.to} 宛て</div>
                    <p className="text-slate-600 mb-2 bg-white p-2 rounded border border-amber-100">{m.text}</p>
                    <button onClick={() => handleApproveLike(m.id)} className="w-full bg-rose-500 text-white font-bold py-1.5 rounded text-xs shadow">
                      ✓ 承認して相手に届ける
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 画面3：本部画面 */}
      {currentRole === 'super_admin' && (
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-12 w-full box-border">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md mb-3 border border-slate-800">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs bg-emerald-600 px-2 py-0.5 rounded font-bold">SC本部 最高管理権限</span>
              <span className="text-xs text-slate-400 font-mono">全国19拠点 総合統括</span>
            </div>
            <h1 className="text-lg font-black">全国19センター 総合分析</h1>
            <p className="text-xs text-slate-300 mt-0.5">全社パート総数: 1,029名 / 総提出率: 92.3%</p>
          </div>

          <div className="flex bg-slate-200 p-1 rounded-xl mb-3 w-full">
            <button 
              onClick={() => setSuperAdminTab('overview')} 
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${superAdminTab === 'overview' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
            >
              拠点サマリー
            </button>
            <button 
              onClick={() => setSuperAdminTab('skills')} 
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${superAdminTab === 'skills' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
            >
              スキル習得率
            </button>
            <button 
              onClick={() => setSuperAdminTab('likes')} 
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${superAdminTab === 'likes' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}
            >
              いいね・メッセージ
            </button>
          </div>

          {superAdminTab === 'overview' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[9px] text-slate-500 block">全国総在籍</span>
                  <span className="text-base font-black text-slate-800">1,029 <span className="text-[10px] font-normal">名</span></span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[9px] text-slate-500 block">提出済み</span>
                  <span className="text-base font-black text-indigo-600">950 <span className="text-[10px] font-normal">名</span></span>
                </div>
                <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-center shadow-xs">
                  <span className="text-[9px] text-rose-600 block">要対応拠点</span>
                  <span className="text-base font-black text-rose-600">2 <span className="text-[10px] font-normal">拠点</span></span>
                </div>
              </div>

              <button 
                onClick={() => alert('全国19センター・1,029名分のシフト希望統合Excelを出力しました。')}
                className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md"
              >
                <span>📥 全国19拠点 統合シフト希望データ (Excel一括出力)</span>
              </button>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-xs text-slate-800 mb-2">全国19拠点 シフト充足率・稼働状況一覧</h3>
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {CENTERS_DATA.map((c) => (
                    <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-800">{c.name}</span>
                          <span className="text-[9px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded">{c.region}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          提出: {c.submittedCount}/{c.staffCount}名 ({Math.round((c.submittedCount/c.staffCount)*100)}%)
                        </div>
                        {c.alert && (
                          <span className="inline-block mt-0.5 text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                            ⚠️ {c.alert}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-black px-2 py-0.5 rounded ${
                          c.fillRate >= 90 ? 'bg-emerald-100 text-emerald-800' :
                          c.fillRate >= 80 ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          充足率 {c.fillRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {superAdminTab === 'skills' && (
            <div className="space-y-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-xs text-slate-800">全19センター スキル習得進捗・多能工化率</h3>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">全社平均: 4.8個</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-3">各拠点のパート従業員におけるスキル習得進捗と1人あたり平均保有数です。</p>

                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {CENTERS_DATA.map((c) => (
                    <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-800">{c.name}</span>
                          <span className="text-[9px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded">{c.staffCount}名</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          1人あたり平均: <strong className="text-slate-700">{c.avgSkills} 個</strong>
                        </div>
                      </div>

                      <div className="text-right flex items-center space-x-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden hidden sm:block">
                          <div className="bg-indigo-600 h-full" style={{ width: `${c.skillRate}%` }} />
                        </div>
                        <span className={`text-xs font-black px-2 py-0.5 rounded ${
                          c.skillRate >= 70 ? 'bg-emerald-100 text-emerald-800' :
                          c.skillRate >= 60 ? 'bg-indigo-100 text-indigo-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          進捗 {c.skillRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {superAdminTab === 'likes' && (
            <div className="space-y-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-xs text-slate-800">全センター いいね（サンクスカード）運用率</h3>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold">全社平均: 81%</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">各センターの月間送信枠（月3件）に対する消化率です。</p>

                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {CENTERS_DATA.map((c) => (
                    <div key={c.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 truncate">{c.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        c.likeUsageRate >= 80 ? 'bg-rose-100 text-rose-700' :
                        c.likeUsageRate >= 65 ? 'bg-slate-200 text-slate-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {c.likeUsageRate}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-xs text-slate-800">全国サンクスカード メッセージ履歴（全社）</h3>
                  <span className="text-[10px] text-slate-400">最新順</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {allMessages.map((m) => (
                    <div key={m.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="bg-slate-800 text-white font-bold text-[9px] px-1.5 py-0.2 rounded">{m.center}</span>
                          <span className="font-bold text-slate-800">{m.from} ➔ {m.to}</span>
                        </div>
                        <span className="text-[9px] text-slate-400">{m.sentAt}</span>
                      </div>
                      <p className="text-slate-600 bg-white p-2 rounded border border-slate-100 leading-tight">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
