import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Circle, Gift, Sparkles, Palette, Trophy, 
  RotateCcw, Heart, Camera, Flame, X, Send, Image as ImageIcon, LayoutGrid, ListTodo,
  Stars, Castle, Wand2
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ⚙️ 設定你的電話號碼 (用於一鍵 WhatsApp 領獎，格式：852 + 8位電話號碼)
const BOYFRIEND_PHONE = '85261681833';

// 🏆 迪士尼風格等級頭銜設定 (根據完成的堂數 0 - 24 堂晉升)
const getLevelInfo = (completedCount) => {
  if (completedCount === 0) return { title: '🌱 奇妙畫壇萌新', badge: 'Lv.1' };
  if (completedCount < 4) return { title: '🪄 仙女棒見習生', badge: 'Lv.2' };
  if (completedCount < 8) return { title: '🏰 城堡透視小行家', badge: 'Lv.3' };
  if (completedCount < 12) return { title: '❄️ 冰雪光影練習生', badge: 'Lv.4' };
  if (completedCount < 16) return { title: '🎨 夢幻色彩小達人', badge: 'Lv.5' };
  if (completedCount < 20) return { title: '🧚‍♀️ 奇妙角色魔法師', badge: 'Lv.6' };
  if (completedCount < 24) return { title: '🌟 迪士尼風準畫家', badge: 'Lv.7' };
  return { title: '👑 殿堂級奇妙大師', badge: 'MAX' };
};

// 📋 預設 24 堂任務清單 (分為 6 個階段，每階段 4 堂)
const INITIAL_TASKS = [
  // Stage 1: 第 1 - 4 堂 (完成解鎖獎品 1)
  { id: 1, title: '課堂一', category: '階段一', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 2, title: '課堂二', category: '階段一', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 3, title: '課堂三', category: '階段一', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 4, title: '課堂四', category: '階段一', points: 10, completed: false, photo: null, uploadDate: null },

  // Stage 2: 第 5 - 8 堂 (完成解鎖獎品 2)
  { id: 5, title: '課堂五', category: '階段二', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 6, title: '課堂六', category: '階段二', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 7, title: '課堂七', category: '階段二', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 8, title: '課堂八', category: '階段二', points: 10, completed: false, photo: null, uploadDate: null },

  // Stage 3: 第 9 - 12 堂 (完成解鎖獎品 3)
  { id: 9, title: '課堂九', category: '階段三', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 10, title: '課堂十', category: '階段三', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 11, title: '課堂十一', category: '階段三', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 12, title: '課堂十二', category: '階段三', points: 10, completed: false, photo: null, uploadDate: null },

  // Stage 4: 第 13 - 16 堂 (完成解鎖獎品 4)
  { id: 13, title: '課堂十三', category: '階段四', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 14, title: '課堂十四', category: '階段四', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 15, title: '課堂十五', category: '階段四', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 16, title: '課堂十六', category: '階段四', points: 10, completed: false, photo: null, uploadDate: null },

  // Stage 5: 第 17 - 20 堂 (完成解鎖獎品 5)
  { id: 17, title: '課堂十七', category: '階段五', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 18, title: '課堂十八', category: '階段五', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 19, title: '課堂十九', category: '階段五', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 20, title: '課堂二十', category: '階段五', points: 10, completed: false, photo: null, uploadDate: null },

  // Stage 6: 第 21 - 24 堂 (完成解鎖獎品 6)
  { id: 21, title: '課堂二十一', category: '階段六', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 22, title: '課堂二十二', category: '階段六', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 23, title: '課堂二十三', category: '階段六', points: 10, completed: false, photo: null, uploadDate: null },
  { id: 24, title: '課堂二十四', category: '階段六', points: 10, completed: false, photo: null, uploadDate: null },
];

// 🎁 預設 6 個里程碑獎勵清單 (每完成 4 堂解鎖一個獎品)
const REWARDS = [
  { id: 1, title: '醒你一杯廢水 🥤', desc: '恭喜完成頭 4 堂基礎！', requiredTasks: 4, milestone: '完成第 4 堂' },
  { id: 2, title: '小蛋糕一件 🍰', desc: '突破第 8 堂！', requiredTasks: 8, milestone: '完成第 8 堂' },
  { id: 3, title: '清清地一齊去打個邊爐 🍲', desc: '課程完成一半（12堂）啦！', requiredTasks: 12, milestone: '完成第 12 堂' },
  { id: 4, title: '一齊去食個壽司郎囉 🍣', desc: '就黎望到終點 已經完成 16 堂！', requiredTasks: 16, milestone: '完成第 16 堂' },
  { id: 5, title: '神秘禮物一小份 🎁', desc: '衝刺去到第 20 堂畫畫辛苦晒！', requiredTasks: 20, milestone: '完成第 20 堂' },
  { id: 6, title: '終極神秘大禮一份 🎁', desc: '太叻啦！24 堂圓滿畢業！', requiredTasks: 24, milestone: '完成全部 24 堂' },
];

export default function App() {
  // ✨ 控制進入歡迎畫面的狀態
  const [isEntered, setIsEntered] = useState(false);

  // 狀態管理
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('gf_drawing_tasks_v3');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [claimedRewards, setClaimedRewards] = useState(() => {
    const saved = localStorage.getItem('gf_claimed_rewards_v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [streak, setStreak] = useState(() => {
    return Number(localStorage.getItem('gf_drawing_streak') || 1);
  });

  // 互動與分頁狀態
  const [activeTab, setActiveTab] = useState('quests');
  const [taskFilter, setTaskFilter] = useState('all');
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  // 💙 藍色系幻彩撒花設定
  const triggerConfetti = (particleCount = 100, originY = 0.6) => {
    confetti({
      particleCount,
      spread: 90,
      origin: { y: originY },
      colors: ['#7dd3fc', '#38bdf8', '#fde047', '#e0f2fe', '#818cf8'] // 冰雪藍與魔法金
    });
  };

  // ✨ 歡迎畫面：15秒自動跳轉特效
  useEffect(() => {
    if (!isEntered) {
      triggerConfetti(150, 0.3);
      const timer = setTimeout(() => {
        setIsEntered(true);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isEntered]);

  // 手動點擊進入
  const handleEnter = () => {
    triggerConfetti(120, 0.6);
    setIsEntered(true);
  };

  // 儲存至 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gf_drawing_tasks_v3', JSON.stringify(tasks));
    } catch (e) {
      alert('相片儲存空間差不多滿啦，建議先備份再更換舊相片！');
    }
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('gf_claimed_rewards_v3', JSON.stringify(claimedRewards));
  }, [claimedRewards]);

  useEffect(() => {
    localStorage.setItem('gf_drawing_streak', streak.toString());
  }, [streak]);

  // 計算進度
  const totalTasksCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = Math.round((completedCount / totalTasksCount) * 100);
  const levelInfo = getLevelInfo(completedCount);
  const uploadedArtworks = tasks.filter(t => t.photo);

  const nextReward = REWARDS.find(r => completedCount < r.requiredTasks);
  const unlockedRewardsCount = REWARDS.filter(r => completedCount >= r.requiredTasks).length;

  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'pending') return !task.completed;
    if (taskFilter === 'completed') return task.completed;
    return true;
  });

  const addStreak = () => {
    setStreak(prev => prev + 1);
    triggerConfetti(40, 0.2);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const nextState = !task.completed;
        if (nextState) triggerConfetti(70, 0.7);
        return { ...task, completed: nextState };
      }
      return task;
    }));
  };

  const handlePhotoUpload = (taskId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);

        const today = new Date().toLocaleDateString('zh-HK', { month: 'short', day: 'numeric' });

        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, photo: compressedDataUrl, completed: true, uploadDate: today } : t
        ));
        triggerConfetti(80, 0.6);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleClaimReward = (reward) => {
    if (!claimedRewards.includes(reward.id)) {
      setClaimedRewards([...claimedRewards, reward.id]);
    }
    triggerConfetti(120, 0.5);
    setActiveCoupon(reward);
  };

  const resetAll = () => {
    if (window.confirm('確定要重置全部 24 堂任務進度同埋相片嗎？')) {
      setTasks(INITIAL_TASKS);
      setClaimedRewards([]);
      setStreak(1);
    }
  };

  // ✨ 如果尚未進入，顯示迪士尼魔法特效畫面
  if (!isEntered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-300 via-cyan-200 to-indigo-300 flex flex-col items-center justify-center font-sans relative overflow-hidden">
        {/* 背景漂浮裝飾 (改為城堡與魔法) */}
        <div className="absolute top-1/4 left-1/4 animate-bounce text-6xl opacity-40 mix-blend-overlay">🏰</div>
        <div className="absolute bottom-1/4 right-1/4 animate-pulse text-6xl opacity-40 mix-blend-overlay">❄️</div>
        <div className="absolute top-2/3 left-1/3 animate-bounce text-5xl opacity-40 mix-blend-overlay" style={{ animationDelay: '1s'}}>✨</div>
        
        {/* 主要卡片 */}
        <div className="bg-white/40 p-10 rounded-[3rem] backdrop-blur-md shadow-2xl text-center z-10 animate-in zoom-in duration-1000 border border-white/50 w-[90%] max-w-sm">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Wand2 size={40} className="text-blue-500 animate-pulse" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-700 mb-2">Welcome to Magic Kingdom,</h2>
          <h1 className="text-4xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 leading-tight">
            Princess <br/> Michelle 👸🏻
          </h1>
          
          <p className="text-gray-800 font-medium mb-8 text-sm bg-white/50 py-2 px-4 rounded-xl">
            準備好開始今日嘅奇妙畫畫之旅未呀？🎨
          </p>
          
          <button 
            onClick={handleEnter}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-extrabold text-lg px-8 py-4 rounded-2xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Stars size={22} /> 進入奇妙畫室
          </button>
          
          <p className="text-xs text-gray-500 mt-4 animate-pulse">
            ( 15 秒後自動進入... )
          </p>
        </div>
      </div>
    );
  }

  // 👇 主畫面 (藍色調介面) 👇
  return (
    <div className="min-h-screen bg-sky-50 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl flex flex-col justify-between pb-12 relative overflow-hidden animate-in fade-in duration-500">
        
        {/* 頂部 Header 與角色等級 */}
        <div className="bg-gradient-to-br from-blue-400 via-cyan-400 to-sky-300 text-white p-6 rounded-b-[2.5rem] shadow-lg relative">
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
                <span className="text-sm font-bold text-sky-50">{levelInfo.title}</span>
              </div>
              <h1 className="text-2xl font-extrabold flex items-center gap-2 mt-1">
                <Palette size={26} /> 奇妙小畫家 24 堂
              </h1>
            </div>
          </div>

          {/* 進度條卡片 */}
          <div className="mt-5 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/20">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs font-bold">
                已完成課堂 ({completedCount} / {totalTasksCount} 堂)
              </span>
              <span className="font-black text-lg text-yellow-200">{progress}%</span>
            </div>
            
            <div className="relative w-full bg-black/20 h-3.5 rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-gradient-to-r from-yellow-200 to-amber-400 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-sky-50 font-medium">
              <span>
                {nextReward 
                  ? `🎁 再完成 ${nextReward.requiredTasks - completedCount} 堂即可解鎖：「${nextReward.title.split(' ')[0]}」` 
                  : '🎉 恭喜！已解鎖全部 6 個大獎！'}
              </span>
            </div>
          </div>
        </div>

        {/* 🔀 三分頁切換器 */}
        <div className="px-5 pt-5">
          <div className="bg-blue-50/80 p-1.5 rounded-2xl flex gap-1 border border-blue-100">
            <button
              onClick={() => setActiveTab('quests')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                activeTab === 'quests' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              <ListTodo size={15} />
              課堂 ({completedCount}/24)
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all relative ${
                activeTab === 'rewards' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-amber-500'
              }`}
            >
              <Trophy size={15} />
              獎品 ({unlockedRewardsCount}/6)
              {unlockedRewardsCount > claimedRewards.length && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute top-2 right-2" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                activeTab === 'gallery' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              <LayoutGrid size={15} />
              畫廊 ({uploadedArtworks.length})
            </button>
          </div>
        </div>

        {/* 主內容區 */}
        <div className="p-5 space-y-5 flex-1">
          
          {/* 分頁 1：📋 24 堂課堂任務列表 */}
          {activeTab === 'quests' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                  <Sparkles className="text-blue-500" size={20} /> 24 堂課堂清單
                </h2>
                
                <div className="flex bg-gray-100 p-0.5 rounded-lg text-[11px] font-bold">
                  {[
                    { key: 'all', label: '全部' },
                    { key: 'pending', label: '進行中' },
                    { key: 'completed', label: '已完成' }
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setTaskFilter(f.key)}
                      className={`px-2.5 py-1 rounded-md transition ${
                        taskFilter === f.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const isMilestoneTask = task.id % 4 === 0;
                  const milestoneReward = REWARDS.find(r => r.requiredTasks === task.id);

                  return (
                    <div key={task.id}>
                      <div 
                        className={`p-4 rounded-2xl border transition-all ${
                          task.completed 
                            ? 'bg-blue-50/50 border-blue-200' 
                            : 'bg-white border-gray-100 shadow-sm hover:border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <button onClick={() => toggleTask(task.id)} className="shrink-0 focus:outline-none">
                            {task.completed ? (
                              <CheckCircle2 className="text-blue-500" size={26} />
                            ) : (
                              <Circle className="text-gray-300 hover:text-blue-300" size={26} />
                            )}
                          </button>

                          <div onClick={() => toggleTask(task.id)} className="flex-1 cursor-pointer select-none">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                                {task.category}
                              </span>
                              {isMilestoneTask && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 flex items-center gap-0.5">
                                  👑 大獎里程碑
                                </span>
                              )}
                            </div>
                            <h3 className={`font-bold mt-1 text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                              {task.title}
                            </h3>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <label className="cursor-pointer text-[11px] font-semibold text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition">
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

                        {task.photo && (
                          <div className="mt-3 pt-3 border-t border-blue-100 flex items-center justify-between">
                            <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                              <ImageIcon size={14} /> 已上傳課堂作品！點擊可放大
                            </span>
                            <img 
                              src={task.photo} 
                              alt="作品縮圖" 
                              onClick={() => setPreviewItem(task)}
                              className="w-12 h-12 object-cover rounded-xl border-2 border-white shadow-md cursor-pointer hover:scale-105 transition"
                            />
                          </div>
                        )}
                      </div>

                      {isMilestoneTask && milestoneReward && taskFilter === 'all' && (
                        <div 
                          onClick={() => setActiveTab('rewards')}
                          className={`mt-2 mb-4 px-4 py-2.5 rounded-xl border border-dashed flex items-center justify-between cursor-pointer transition ${
                            completedCount >= milestoneReward.requiredTasks
                              ? 'bg-amber-50 border-amber-300 text-amber-800'
                              : 'bg-gray-50 border-gray-200 text-gray-500'
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs font-bold">
                            <Gift size={15} className={completedCount >= milestoneReward.requiredTasks ? 'text-amber-500' : 'text-gray-400'} />
                            <span>階段獎勵 {milestoneReward.id}：{milestoneReward.title}</span>
                          </div>
                          <span className="text-[11px] font-extrabold underline">
                            {completedCount >= milestoneReward.requiredTasks ? '去領獎 👉' : `需完成 ${milestoneReward.requiredTasks} 堂`}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 分頁 2：🎁 6 個里程碑獎勵兌換區 */}
          {activeTab === 'rewards' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                  <Trophy className="text-amber-500" size={20} /> 6 大里程碑獎品
                </h2>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  每完成 4 堂解鎖 1 個
                </span>
              </div>

              <div className="space-y-3">
                {REWARDS.map(reward => {
                  const isUnlocked = completedCount >= reward.requiredTasks;
                  const isClaimed = claimedRewards.includes(reward.id);

                  return (
                    <div 
                      key={reward.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        isUnlocked ? 'bg-amber-50/60 border-amber-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl shrink-0 ${isUnlocked ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-400'}`}>
                          <Gift size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                              獎品 #{reward.id}
                            </span>
                            <span className="text-xs font-bold text-amber-600">
                              {reward.milestone} ({completedCount}/{reward.requiredTasks})
                            </span>
                          </div>
                          <div className="font-bold text-gray-800 text-sm mt-1">
                            {reward.title}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                            {reward.desc}
                          </p>
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
                        {isClaimed ? '查看兌換券' : isUnlocked ? '立即領取 🎁' : `差 ${reward.requiredTasks - completedCount} 堂`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 分頁 3：🖼️ 專屬畫廊分頁 */}
          {activeTab === 'gallery' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                  <Palette className="text-blue-500" size={20} /> 個人作品展覽館
                </h2>
                <span className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
                  共 {uploadedArtworks.length} / 24 幅作品
                </span>
              </div>

              {uploadedArtworks.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center my-4">
                  <div className="bg-blue-100 text-blue-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <ImageIcon size={28} />
                  </div>
                  <h3 className="font-bold text-gray-700 text-base">奇妙畫廊仲未有作品呀 🎨</h3>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    完成課堂之後，撳任務隔離嘅「打卡作品」上傳畫作，呢度就會自動變成你嘅 24 堂專屬展覽館㗎啦！
                  </p>
                  <button
                    onClick={() => setActiveTab('quests')}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
                  >
                    去課堂任務打卡 👉
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  {uploadedArtworks.map(art => (
                    <div 
                      key={art.id}
                      onClick={() => setPreviewItem(art)}
                      className="bg-white border border-gray-100 rounded-2xl p-2.5 shadow-sm hover:shadow-md hover:border-blue-200 transition cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-2.5 relative">
                          <img 
                            src={art.photo} 
                            alt={art.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <span className="absolute top-2 left-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            第 {art.id} 堂
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
                        <Heart size={13} className="text-blue-400 fill-blue-400" />
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
              <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-6 text-white text-center relative">
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
                  VIP 專屬獎勵兌換券 #{activeCoupon.id}
                </span>
                <h3 className="text-xl font-black mt-3">{activeCoupon.title}</h3>
              </div>

              <div className="p-6 text-center space-y-5">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {activeCoupon.desc}
                </p>

                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-3 bg-gray-50">
                  <div className="text-[11px] text-gray-400">兌換狀態</div>
                  <div className="text-sm font-bold text-blue-600 mt-0.5">
                    ✅ 已達成「{activeCoupon.milestone}」目標解鎖
                  </div>
                </div>

                <div className="space-y-2.5">
                  <a
                    href={`https://wa.me/${BOYFRIEND_PHONE}?text=${encodeURIComponent(`親愛嘅！我已經完成咗 ${activeCoupon.requiredTasks} 堂畫畫任務，成功解鎖第 ${activeCoupon.id} 個大獎【${activeCoupon.title}】啦！快啲同我兌換啦 🎉❤️`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-md transition"
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

        {/* 🔍 畫作相片放大預覽 Modal */}
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
                <span className="text-[11px] font-bold text-blue-500 bg-blue-50 px-2.5 py-0.5 rounded-md">
                  {previewItem.category}
                </span>
                <h3 className="font-extrabold text-gray-800 text-base mt-1.5">
                  {previewItem.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <Heart size={13} className="text-blue-400 fill-blue-400" /> 奇妙畫廊珍藏作品
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}