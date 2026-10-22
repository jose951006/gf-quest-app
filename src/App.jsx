import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, Gift, Sparkles, Palette, Trophy, 
  RotateCcw, Heart, Camera, Flame, X, Send, Image as ImageIcon, LayoutGrid, ListTodo
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ⚙️ 設定你的電話號碼 (用於一鍵 WhatsApp 領獎，格式：852 + 8位電話號碼)
const BOYFRIEND_PHONE = '85291234567';

// 🏆 等級頭銜設定
const getLevelInfo = (progress) => {
  if (progress === 0) return { title: '🌱 畫壇小萌新', badge: 'Lv.1' };
  if (progress < 40) return { title: '✏️ 線條魔法見習生', badge: 'Lv.2' };
  if (progress < 75) return { title: '🎨 色彩調配小達人', badge: 'Lv.3' };
  if (progress < 100) return { title: '✨ 靈感爆發畫家', badge: 'Lv.4' };
  return { title: '👑 殿堂級藝術大師', badge: 'MAX' };
};

// 📋 預設任務清單
const INITIAL_TASKS = [
  { id: 1, title: '準備畫具與熟悉軟件介面', category: '基礎準備', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 2, title: '完成課堂一：線條與幾何練習', category: '繪畫基礎', points: 20, completed: false, photo: null, uploadDate: null },
  { id: 3, title: '完成課堂二：光影與立體感', category: '繪畫基礎', points: 20, completed: false, photo: null, uploadDate: null },
  { id: 4, title: '完成課堂三：色彩搭配技巧', category: '進階技巧', points: 25, completed: false, photo: null, uploadDate: null },
  { id: 5, title: '完成課堂四：第一幅完整作品！', category: '最終挑戰', points: 25, completed: false, photo: null, uploadDate: null },
];

// 🎁 預設獎勵清單
const REWARDS = [
  { id: 1, title: '手搖飲品兌換券 🧋', desc: '任揀最愛的手搖飲品一杯，加料唔洗錢！', requiredProgress: 20 },
  { id: 2, title: '專屬畫具 / 貼紙包 🎨', desc: '帶你去揀一套新畫具或者可愛貼紙包！', requiredProgress: 50 },
  { id: 3, title: '週末浪漫大餐 + 神秘禮物 🎁', desc: '慶祝畢業！由你話事食邊間餐廳 + 神秘驚喜！', requiredProgress: 100 },
];

export default function App() {
  // 狀態管理 (連接 localStorage)
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('gf_drawing_tasks_v2');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [claimedRewards, setClaimedRewards] = useState(() => {
    const saved = localStorage.getItem('gf_claimed_rewards_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [streak, setStreak] = useState(() => {
    return Number(localStorage.getItem('gf_drawing_streak') || 1);
  });

  // 互動與分頁狀態
  const [activeTab, setActiveTab] = useState('quests'); // 'quests' | 'gallery'
  const [activeCoupon, setActiveCoupon] = useState(null); // 控制彈出哪張禮物券
  const [previewItem, setPreviewItem] = useState(null); // 控制放大預覽的作品資訊

  // 儲存至 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gf_drawing_tasks_v2', JSON.stringify(tasks));
    } catch (e) {
      alert('相片容量太大啦，建議刪除一張舊相片再試！');
    }
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('gf_claimed_rewards_v2', JSON.stringify(claimedRewards));
  }, [claimedRewards]);

  useEffect(() => {
    localStorage.setItem('gf_drawing_streak', streak.toString());
  }, [streak]);

  // 計算進度、等級與已上傳作品
  const totalPoints = tasks.reduce((sum, task) => sum + task.points, 0);
  const earnedPoints = tasks.filter(t => t.completed).reduce((sum, task) => sum + task.points, 0);
  const progress = Math.round((earnedPoints / totalPoints) * 100);
  const levelInfo = getLevelInfo(progress);
  const uploadedArtworks = tasks.filter(t => t.photo);

  // 增加打卡天數
  const addStreak = () => {
    setStreak(prev => prev + 1);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.2 } });
  };

  // 切換任務完成狀態
  const toggleTask = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const nextState = !task.completed;
        if (nextState) {
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.7 } });
        }
        return { ...task, completed: nextState };
      }
      return task;
    }));
  };

  // 處理上傳畫作相片 (自動壓縮並記錄日期)
  const handlePhotoUpload = (taskId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);

        const today = new Date().toLocaleDateString('zh-HK', { month: 'short', day: 'numeric' });

        setTasks(tasks.map(t => 
          t.id === taskId 
            ? { ...t, photo: compressedDataUrl, completed: true, uploadDate: today } 
            : t
        ));
        confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // 領取獎勵並打開兌換券 Modal
  const handleClaimReward = (reward) => {
    if (!claimedRewards.includes(reward.id)) {
      setClaimedRewards([...claimedRewards, reward.id]);
    }
    confetti({ particleCount: 120, spread: 110, origin: { y: 0.5 } });
    setActiveCoupon(reward);
  };

  // 重置所有進度
  const resetAll = () => {
    if (window.confirm('確定要重置所有任務進度同埋相片嗎？')) {
      setTasks(INITIAL_TASKS);
      setClaimedRewards([]);
      setStreak(1);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col justify-between pb-12 relative overflow-hidden">
        
        {/* 頂部 Header 與角色等級 */}
        <div className="bg-gradient-to-br from-pink-400 via-rose-400 to-amber-300 text-white p-6 rounded-b-[2.5rem] shadow-lg relative">
          <div className="flex items-center justify-between mb-3">
            {/* 打卡火苗 */}
            <button 
              onClick={addStreak}
              className="flex items-center gap-1.5 text-xs font-bold bg-white/25 hover:bg-white/35 active:scale-95 transition px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm"
            >
              <Flame size={15} className="text-amber-200 fill-amber-200" />
              累積畫畫 {streak} 日 (點我打卡)
            </button>

            <button onClick={resetAll} className="text-white/80 hover:text-white p-1" title="重置進度">
              <RotateCcw size={16} />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-300 text-amber-950 text-xs font-black px-2 py-0.5 rounded-md">
                  {levelInfo.badge}
                </span>
                <span className="text-sm font-bold text-pink-50">{levelInfo.title}</span>
              </div>
              <h1 className="text-2xl font-extrabold flex items-center gap-2 mt-1">
                <Palette size={26} /> 小畫家養成計劃
              </h1>
            </div>
          </div>

          {/* 進度條卡片 */}
          <div className="mt-5 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/20">
            <div className="flex justify-between text-sm font-medium mb-1.5">
              <span>目前經驗值 ({earnedPoints}/{totalPoints} EXP)</span>
              <span className="font-black text-lg text-yellow-200">{progress}%</span>
            </div>
            <div className="w-full bg-black/20 h-3.5 rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-gradient-to-r from-yellow-200 to-amber-400 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 🔀 分頁切換器 (Tab Switcher) */}
        <div className="px-5 pt-5">
          <div className="bg-pink-50/80 p-1.5 rounded-2xl flex gap-1 border border-pink-100">
            <button
              onClick={() => setActiveTab('quests')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'quests'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-500 hover:text-pink-500'
              }`}
            >
              <ListTodo size={16} />
              課堂任務 & 獎品
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'gallery'
                  ? 'bg-white text-pink-600 shadow-sm'
                  : 'text-gray-500 hover:text-pink-500'
              }`}
            >
              <LayoutGrid size={16} />
              專屬畫廊 ({uploadedArtworks.length}/{tasks.length})
            </button>
          </div>
        </div>

        {/* 主內容區 */}
        <div className="p-5 space-y-6 flex-1">
          
          {activeTab === 'quests' ? (
            <>
              {/* 📋 任務列表 (支援上傳作品) */}
              <div>
                <h2 className="text-lg font-extrabold text-gray-800 mb-3 flex items-center gap-2">
                  <Sparkles className="text-pink-500" size={20} /> 課堂任務清單
                </h2>
                <div className="space-y-3">
                  {tasks.map(task => (
                    <div 
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        task.completed 
                          ? 'bg-pink-50/50 border-pink-200' 
                          : 'bg-white border-gray-100 shadow-sm hover:border-pink-200'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <button onClick={() => toggleTask(task.id)} className="shrink-0 focus:outline-none">
                          {task.completed ? (
                            <CheckCircle2 className="text-pink-500" size={26} />
                          ) : (
                            <Circle className="text-gray-300 hover:text-pink-300" size={26} />
                          )}
                        </button>

                        <div onClick={() => toggleTask(task.id)} className="flex-1 cursor-pointer select-none">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                            {task.category}
                          </span>
                          <h3 className={`font-bold mt-1 text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                            {task.title}
                          </h3>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-xs font-extrabold text-pink-500 bg-pink-50 px-2.5 py-0.5 rounded-full">
                            +{task.points}%
                          </span>
                          
                          {/* 上傳畫作按鈕 */}
                          <label className="cursor-pointer text-[11px] font-semibold text-gray-500 hover:text-pink-600 bg-gray-100 hover:bg-pink-100 px-2 py-1 rounded-lg flex items-center gap-1 transition">
                            <Camera size={13} />
                            <span>{task.photo ? '更換作品' : '打卡作品'}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handlePhotoUpload(task.id, e)}
                            />
                          </label>
                        </div>
                      </div>

                      {/* 如果有上傳相片，顯示作品縮圖 */}
                      {task.photo && (
                        <div className="mt-3 pt-3 border-t border-pink-100 flex items-center justify-between">
                          <span className="text-xs text-pink-600 font-medium flex items-center gap-1">
                            <ImageIcon size={14} /> 已上傳課堂作品！點擊可放大
                          </span>
                          <img 
                            src={task.photo} 
                            alt="作品縮圖" 
                            onClick={() => setPreviewItem(task)}
                            className="w-14 h-14 object-cover rounded-xl border-2 border-white shadow-md cursor-pointer hover:scale-105 transition"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 🎁 獎勵兌換區 */}
              <div>
                <h2 className="text-lg font-extrabold text-gray-800 mb-3 flex items-center gap-2">
                  <Trophy className="text-amber-500" size={20} /> 里程碑獎品
                </h2>
                <div className="space-y-3">
                  {REWARDS.map(reward => {
                    const isUnlocked = progress >= reward.requiredProgress;
                    const isClaimed = claimedRewards.includes(reward.id);

                    return (
                      <div 
                        key={reward.id}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                          isUnlocked ? 'bg-amber-50/50 border-amber-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${isUnlocked ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-400'}`}>
                            <Gift size={22} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-amber-600">
                              需達 {reward.requiredProgress}% 進度
                            </div>
                            <div className="font-bold text-gray-800 text-sm mt-0.5">
                              {reward.title}
                            </div>
                          </div>
                        </div>

                        <button
                          disabled={!isUnlocked}
                          onClick={() => handleClaimReward(reward)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                            isClaimed
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : isUnlocked
                              ? 'bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-md hover:opacity-95 active:scale-95 animate-pulse'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isClaimed ? '查看兌換券' : isUnlocked ? '立即領取 🎁' : '未解鎖'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* 🖼️ 專屬畫廊分頁 (Gallery View) */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                  <Palette className="text-pink-500" size={20} /> 個人作品展覽館
                </h2>
                <span className="text-xs font-bold text-pink-500 bg-pink-50 px-3 py-1 rounded-full">
                  共 {uploadedArtworks.length} 幅作品
                </span>
              </div>

              {uploadedArtworks.length === 0 ? (
                /* 尚未上傳任何畫作時的空白狀態 */
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center my-4">
                  <div className="bg-pink-100 text-pink-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <ImageIcon size={28} />
                  </div>
                  <h3 className="font-bold text-gray-700 text-base">畫廊仲未有作品呀 🎨</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    完成課堂之後，撳任務隔離嘅「打卡作品」上傳畫作，呢度就會自動變成你嘅專屬展覽館㗎啦！
                  </p>
                  <button
                    onClick={() => setActiveTab('quests')}
                    className="mt-4 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
                  >
                    去課堂任務打卡 👉
                  </button>
                </div>
              ) : (
                /* 雙欄作品集網格 */
                <div className="grid grid-cols-2 gap-3.5">
                  {uploadedArtworks.map(art => (
                    <div 
                      key={art.id}
                      onClick={() => setPreviewItem(art)}
                      className="bg-white border border-gray-100 rounded-2xl p-2.5 shadow-sm hover:shadow-md hover:border-pink-200 transition cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2.5 relative">
                          <img 
                            src={art.photo} 
                            alt={art.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <span className="absolute top-2 left-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {art.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-xs line-clamp-2 leading-snug px-1">
                          {art.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 px-1">
                        <span className="text-[10px] text-gray-400">
                          {art.uploadDate ? `${art.uploadDate} 作品` : '已收藏'}
                        </span>
                        <Heart size={13} className="text-pink-400 fill-pink-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* 🎟️ 彈出式「專屬禮物兌換券」Modal */}
        {activeCoupon && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5 z-50">
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="bg-gradient-to-r from-amber-400 to-rose-400 p-6 text-white text-center relative">
                <button 
                  onClick={() => setActiveCoupon(null)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white"
                >
                  <X size={20} />
                </button>
                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                  <Gift size={36} className="text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider bg-black/15 px-3 py-1 rounded-full">
                  VIP 專屬獎勵兌換券
                </span>
                <h3 className="text-xl font-black mt-3">{activeCoupon.title}</h3>
              </div>

              <div className="p-6 text-center space-y-5">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {activeCoupon.desc}
                </p>

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-3 bg-gray-50">
                  <div className="text-[11px] text-gray-400">兌換狀態</div>
                  <div className="text-sm font-bold text-emerald-600 mt-0.5">✅ 已達成 {activeCoupon.requiredProgress}% 目標解鎖</div>
                </div>

                <div className="space-y-2.5">
                  <a
                    href={`https://wa.me/${BOYFRIEND_PHONE}?text=${encodeURIComponent(`親愛嘅！我已經完成畫畫任務，解鎖咗【${activeCoupon.title}】啦！快啲同我兌換啦 🎉❤️`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <Send size={16} />
                    一鍵 WhatsApp 男朋友兌換
                  </a>
                  <button
                    onClick={() => setActiveCoupon(null)}
                    className="w-full py-2.5 text-xs font-semibold text-gray-400 hover:text-gray-600"
                  >
                    稍後再兌換
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🔍 畫作相片放大預覽 Modal (支援顯示課堂名稱) */}
        {previewItem && (
          <div 
            onClick={() => setPreviewItem(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-5 z-50"
          >
            <div className="max-w-sm w-full bg-white p-3 rounded-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <img 
                  src={previewItem.photo} 
                  alt={previewItem.title} 
                  className="w-full max-h-[65vh] object-contain rounded-2xl bg-gray-50" 
                />
                <button 
                  onClick={() => setPreviewItem(null)}
                  className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-3 text-center">
                <span className="text-[11px] font-bold text-pink-500 bg-pink-50 px-2.5 py-0.5 rounded-md">
                  {previewItem.category}
                </span>
                <h3 className="font-extrabold text-gray-800 text-base mt-1.5">
                  {previewItem.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <Heart size={13} className="text-pink-400 fill-pink-400" /> 專屬畫廊珍藏作品
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}