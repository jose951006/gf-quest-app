import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Gift,
  Sparkles,
  Palette,
  Trophy,
  RotateCcw,
  Heart,
  Camera,
  Flame,
  X,
  Send,
  Image as ImageIcon,
  LayoutGrid,
  ListTodo,
  Stars,
  Castle,
  Wand2,
  KeyRound,
  UploadCloud
} from "lucide-react";
import confetti from "canvas-confetti";
import { supabase } from "./supabaseClient"; // 🔗 引入 Supabase 連線設定

// ⚙️ 設定你的電話號碼 (用於一鍵 WhatsApp 領獎，格式：852 + 8位電話號碼)
const BOYFRIEND_PHONE = "85261681833";

// 🏆 溫柔風格等級頭銜設定 (根據完成的堂數 0 - 24 堂晉升)
const getLevelInfo = (completedCount) => {
  if (completedCount === 0) return { title: "🌱 溫柔畫壇萌新", badge: "Lv.1" };
  if (completedCount < 4) return { title: "🪄 柔光筆見習生", badge: "Lv.2" };
  if (completedCount < 8) return { title: "☁️ 晴空透視小行家", badge: "Lv.3" };
  if (completedCount < 12) return { title: "💧 輕柔光影練習生", badge: "Lv.4" };
  if (completedCount < 16) return { title: "🎨 夢幻粉藍小達人", badge: "Lv.5" };
  if (completedCount < 20) return { title: "🧚‍♀️ 溫柔魔法師", badge: "Lv.6" };
  if (completedCount < 24) return { title: "🌟 晴空準畫家", badge: "Lv.7" };
  return { title: "👑 殿堂級溫柔大師", badge: "MAX" };
};

// 📋 預設 24 堂任務清單
const INITIAL_TASKS = [
  { id: 1, title: "課堂一", category: "階段一", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 2, title: "課堂二", category: "階段一", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 3, title: "課堂三", category: "階段一", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 4, title: "課堂四", category: "階段一", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 5, title: "課堂五", category: "階段二", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 6, title: "課堂六", category: "階段二", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 7, title: "課堂七", category: "階段二", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 8, title: "課堂八", category: "階段二", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 9, title: "課堂九", category: "階段三", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 10, title: "課堂十", category: "階段三", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 11, title: "課堂十一", category: "階段三", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 12, title: "課堂十二", category: "階段三", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 13, title: "課堂十三", category: "階段四", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 14, title: "課堂十四", category: "階段四", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 15, title: "課堂十五", category: "階段四", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 16, title: "課堂十六", category: "階段四", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 17, title: "課堂十七", category: "階段五", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 18, title: "課堂十八", category: "階段五", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 19, title: "課堂十九", category: "階段五", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 20, title: "課堂二十", category: "階段五", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 21, title: "課堂二十一", category: "階段六", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 22, title: "課堂二十二", category: "階段六", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 23, title: "課堂二十三", category: "階段六", points: 10, completed: false, photo: null, uploadDate: null },
  { id: 24, title: "課堂二十四", category: "階段六", points: 10, completed: false, photo: null, uploadDate: null },
];

// 🎁 預設 6 個里程碑獎勵清單
const REWARDS = [
  { id: 1, title: "醒你一杯廢水 🥤", desc: "恭喜完成頭 4 堂基礎！", requiredTasks: 4, milestone: "完成第 4 堂" },
  { id: 2, title: "小蛋糕一件 🍰", desc: "突破第 8 堂！", requiredTasks: 8, milestone: "完成第 8 堂" },
  { id: 3, title: "清清地一齊去打個邊爐 🍲", desc: "課程完成一半（12堂）啦！", requiredTasks: 12, milestone: "完成第 12 堂" },
  { id: 4, title: "一齊去食個壽司郎囉 🍣", desc: "就黎望到終點 已經完成 16 堂！", requiredTasks: 16, milestone: "完成第 16 堂" },
  { id: 5, title: "神秘禮物一小份 🎁", desc: "衝刺去到第 20 堂畫畫辛苦晒！", requiredTasks: 20, milestone: "完成第 20 堂" },
  { id: 6, title: "終極神秘大禮一份 🎁", desc: "太叻啦！24 堂圓滿畢業！", requiredTasks: 24, milestone: "完成全部 24 堂" },
];

export default function App() {
  const [isEntered, setIsEntered] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [streak, setStreak] = useState(1);
  const [lastStreakDate, setLastStreakDate] = useState(null);

  const [activeTab, setActiveTab] = useState("quests");
  const [taskFilter, setTaskFilter] = useState("all");
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // 🖼️ 上傳專屬 Popup 的狀態
  const [uploadTaskTarget, setUploadTaskTarget] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const triggerConfetti = (particleCount = 100, originY = 0.6) => {
    confetti({
      particleCount,
      spread: 90,
      origin: { y: originY },
      colors: ["#bae6fd", "#7dd3fc", "#e0f2fe", "#fef08a", "#c7d2fe"],
    });
  };

  useEffect(() => {
    if (!isEntered) {
      triggerConfetti(120, 0.3);
      const timer = setTimeout(() => setIsEntered(true), 15000);
      return () => clearTimeout(timer);
    }
  }, [isEntered]);

  const handleEnterClick = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === "0314") {
      triggerConfetti(120, 0.6);
      setShowPasswordModal(false);
      setIsEntered(true);
    } else {
      setPasswordError(true);
      setPasswordInput("");
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const { data: tasksData } = await supabase.from("tasks").select("*").order("id");
        if (tasksData && tasksData.length > 0) setTasks(tasksData);

        const { data: streakData } = await supabase.from("user_streak").select("*").eq("id", 1).single();
        if (streakData) {
          setStreak(streakData.streak || 1);
          setLastStreakDate(streakData.last_streak_date || null);
        }

        const { data: rewardsData } = await supabase.from("claimed_rewards").select("reward_id");
        if (rewardsData) {
          setClaimedRewards(rewardsData.map((r) => r.reward_id));
        }
      } catch (error) {
        console.error("從資料庫載入資料失敗:", error.message);
      }
    };
    fetchAllData();
  }, []);

  const totalTasksCount = tasks.length || 24;
  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = Math.round((completedCount / totalTasksCount) * 100) || 0;
  const levelInfo = getLevelInfo(completedCount);
  const uploadedArtworks = tasks.filter((t) => t.photo);

  const nextReward = REWARDS.find((r) => completedCount < r.requiredTasks);
  const unlockedRewardsCount = REWARDS.filter((r) => completedCount >= r.requiredTasks).length;

  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === "pending") return !task.completed;
    if (taskFilter === "completed") return task.completed;
    return true;
  });

  const addStreak = async () => {
    const today = new Date().toLocaleDateString("zh-HK");
    if (lastStreakDate === today) return;

    const newStreak = streak + 1;
    setStreak(newStreak);
    setLastStreakDate(today);
    triggerConfetti(40, 0.2);

    await supabase.from("user_streak")
      .update({ streak: newStreak, last_streak_date: today })
      .eq("id", 1);
  };

  const toggleTask = async (id) => {
    const targetTask = tasks.find((t) => t.id === id);
    if (!targetTask) return;
    const nextState = !targetTask.completed;

    setTasks(tasks.map((task) => {
      if (task.id === id) {
        if (nextState) triggerConfetti(70, 0.7);
        return { ...task, completed: nextState };
      }
      return task;
    }));

    await supabase.from("tasks").update({ completed: nextState }).eq("id", id);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const confirmUpload = async () => {
    if (!selectedFile || !uploadTaskTarget) return;

    setIsUploading(true);
    const taskId = uploadTaskTarget.id;
    const fileExt = selectedFile.name.split(".").pop();
    const fileName = `task_${taskId}_${Date.now()}.${fileExt}`;
    const today = new Date().toLocaleDateString("zh-HK", { month: "short", day: "numeric" });

    try {
      const { error: uploadError } = await supabase.storage
        .from("artworks")
        .upload(fileName, selectedFile, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("artworks").getPublicUrl(fileName);
      const photoUrl = publicUrlData.publicUrl;

      await supabase.from("tasks")
        .update({ photo: photoUrl, completed: true, uploadDate: today })
        .eq("id", taskId);

      setTasks(tasks.map((t) => t.id === taskId ? { ...t, photo: photoUrl, completed: true, uploadDate: today } : t));
      triggerConfetti(80, 0.6);

      setUploadTaskTarget(null);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      alert("上傳失敗，請檢查網路連線！");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClaimReward = async (reward) => {
    if (!claimedRewards.includes(reward.id)) {
      setClaimedRewards([...claimedRewards, reward.id]);
      await supabase.from("claimed_rewards").insert({ reward_id: reward.id });
    }
    triggerConfetti(120, 0.5);
    setActiveCoupon(reward);
  };

  const resetAll = async () => {
    if (window.confirm("確定要重置全部 24 堂任務進度同埋相片嗎？")) {
      try {
        await supabase.from("tasks").update({ completed: false, photo: null, uploadDate: null }).neq("id", 0);
        await supabase.from("user_streak").update({ streak: 1, last_streak_date: null }).eq("id", 1);
        await supabase.from("claimed_rewards").delete().neq("reward_id", 0);

        setTasks(INITIAL_TASKS);
        setClaimedRewards([]);
        setStreak(1);
        setLastStreakDate(null);
      } catch (error) {
        alert("重置失敗！");
        console.error(error);
      }
    }
  };

  if (!isEntered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100 flex flex-col items-center justify-center font-sans relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 animate-bounce text-6xl opacity-30 mix-blend-overlay">☁️</div>
        <div className="absolute bottom-1/4 right-1/4 animate-pulse text-6xl opacity-30 mix-blend-overlay">💧</div>
        <div className="absolute top-2/3 left-1/3 animate-bounce text-5xl opacity-30 mix-blend-overlay" style={{ animationDelay: "1s" }}>✨</div>

        <div className="bg-white/70 p-10 rounded-[3rem] backdrop-blur-md shadow-xl text-center z-10 animate-in zoom-in duration-1000 border border-sky-100 w-[90%] max-w-sm">
          <div className="bg-sky-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Wand2 size={40} className="text-sky-500 animate-pulse" />
          </div>

          <h2 className="text-xl font-bold text-slate-600 mb-2">Welcome to Cozy Art,</h2>
          <h1 className="text-4xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-blue-600 leading-tight">
            Princess <br /> Michelle 👸🏻
          </h1>

          <p className="text-slate-600 font-medium mb-8 text-sm bg-sky-50/80 py-2 px-4 rounded-xl">
            準備好開始今日嘅溫柔畫畫之旅未呀？🎨
          </p>

          {!showPasswordModal ? (
            <button
              onClick={handleEnterClick}
              className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-extrabold text-lg px-8 py-4 rounded-2xl shadow-md hover:scale-105 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Stars size={22} /> 進入溫柔畫室
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <KeyRound size={18} />
                </span>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  placeholder="請輸入 4 位數密碼"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-white/90 border-2 border-sky-200 focus:border-sky-400 rounded-2xl text-center text-lg font-bold tracking-widest text-slate-700 outline-none shadow-inner transition"
                />
              </div>

              {passwordError && (
                <p className="text-xs font-bold text-rose-400 animate-bounce">
                  ❌ 密碼錯誤，請重新輸入！ (提示: 0314)
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-2xl text-sm transition"
                >
                  返回
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-sky-400 to-blue-500 hover:opacity-95 text-white font-bold py-3 rounded-2xl text-sm shadow-sm transition"
                >
                  解鎖進入 🔓
                </button>
              </div>
            </form>
          )}

          {!showPasswordModal && (
            <p className="text-xs text-slate-400 mt-4 animate-pulse">
              ( 15 秒後自動進入... )
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50/50 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col justify-between pb-12 relative overflow-hidden animate-in fade-in duration-500">
        
        {/* 頂部 Header - 改為柔和的晴空藍漸層 */}
        <div className="bg-gradient-to-br from-sky-300 via-sky-400 to-blue-400 text-white p-6 rounded-b-[2.5rem] shadow-md relative">
          <div className="flex items-center justify-between mb-3">
            {(() => {
              const today = new Date().toLocaleDateString("zh-HK");
              const hasCheckedInToday = lastStreakDate === today;

              return (
                <button
                  onClick={addStreak}
                  disabled={hasCheckedInToday}
                  className={`flex items-center gap-1.5 text-xs font-bold transition px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm ${
                    hasCheckedInToday
                      ? "bg-white/30 cursor-not-allowed text-white/90"
                      : "bg-white/20 hover:bg-white/30 active:scale-95"
                  }`}
                >
                  <Flame
                    size={15}
                    className={
                      hasCheckedInToday
                        ? "text-amber-100/60 fill-amber-100/60"
                        : "text-amber-200 fill-amber-200"
                    }
                  />
                  {hasCheckedInToday
                    ? `今日已打卡 (連續 ${streak} 日)`
                    : `累積畫畫 ${streak} 日 (點我打卡)`}
                </button>
              );
            })()}

            <button
              onClick={resetAll}
              className="text-white/80 hover:text-white p-1"
              title="重置進度"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-200/90 text-amber-900 text-xs font-black px-2 py-0.5 rounded-md">
                  {levelInfo.badge}
                </span>
                <span className="text-sm font-bold text-sky-50">
                  {levelInfo.title}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold flex items-center gap-2 mt-1">
                <Palette size={26} /> 溫柔小畫家 24 堂
              </h1>
            </div>
          </div>

          {/* 進度條 */}
          <div className="mt-5 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/20">
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-xs font-bold">
                已完成課堂 ({completedCount} / {totalTasksCount} 堂)
              </span>
              <span className="font-black text-lg text-amber-100">
                {progress}%
              </span>
            </div>

            <div className="relative w-full bg-black/15 h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-amber-200 to-yellow-300 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-sky-50 font-medium">
              <span>
                {nextReward
                  ? `🎁 再完成 ${nextReward.requiredTasks - completedCount} 堂即可解鎖：「${nextReward.title.split(" ")[0]}」`
                  : "🎉 恭喜！已解鎖全部 6 個大獎！"}
              </span>
            </div>
          </div>
        </div>

        {isUploading && (
          <div className="bg-sky-100 text-sky-700 text-xs font-bold text-center py-2 animate-pulse">
            ☁️ 正在將畫作上傳至溫柔雲端，請稍候...
          </div>
        )}

        {/* 三分頁切換器 */}
        <div className="px-5 pt-5">
          <div className="bg-sky-50 p-1.5 rounded-2xl flex gap-1 border border-sky-100">
            <button
              onClick={() => setActiveTab("quests")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                activeTab === "quests"
                  ? "bg-white text-sky-600 shadow-sm"
                  : "text-slate-400 hover:text-sky-500"
              }`}
            >
              <ListTodo size={15} />
              課堂 ({completedCount}/24)
            </button>
            <button
              onClick={() => setActiveTab("rewards")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all relative ${
                activeTab === "rewards"
                  ? "bg-white text-amber-600 shadow-sm"
                  : "text-slate-400 hover:text-amber-500"
              }`}
            >
              <Trophy size={15} />
              獎品 ({unlockedRewardsCount}/6)
              {unlockedRewardsCount > claimedRewards.length && (
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping absolute top-2 right-2" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                activeTab === "gallery"
                  ? "bg-white text-sky-600 shadow-sm"
                  : "text-slate-400 hover:text-sky-500"
              }`}
            >
              <LayoutGrid size={15} />
              畫廊 ({uploadedArtworks.length})
            </button>
          </div>
        </div>

        {/* 主內容區 */}
        <div className="p-5 space-y-5 flex-1">
          {activeTab === "quests" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-extrabold text-slate-700 flex items-center gap-2">
                  <Sparkles className="text-sky-400" size={20} /> 24 堂課堂清單
                </h2>
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                  {[
                    { key: "all", label: "全部" },
                    { key: "pending", label: "進行中" },
                    { key: "completed", label: "已完成" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setTaskFilter(f.key)}
                      className={`px-2.5 py-1 rounded-md transition ${
                        taskFilter === f.key
                          ? "bg-white text-sky-600 shadow-sm"
                          : "text-slate-400"
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
                  const milestoneReward = REWARDS.find(
                    (r) => r.requiredTasks === task.id,
                  );

                  return (
                    <div key={task.id}>
                      <div
                        className={`p-4 rounded-2xl border transition-all ${task.completed ? "bg-sky-50/40 border-sky-200" : "bg-white border-slate-100 shadow-sm hover:border-sky-200"}`}
                      >
                        <div className="flex items-center gap-3.5">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="shrink-0 focus:outline-none"
                          >
                            {task.completed ? (
                              <CheckCircle2
                                className="text-sky-500"
                                size={26}
                              />
                            ) : (
                              <Circle
                                className="text-slate-200 hover:text-sky-300"
                                size={26}
                              />
                            )}
                          </button>

                          <div
                            onClick={() => toggleTask(task.id)}
                            className="flex-1 cursor-pointer select-none"
                          >
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                                {task.category}
                              </span>
                              {isMilestoneTask && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">
                                  👑 大獎里程碑
                                </span>
                              )}
                            </div>
                            <h3
                              className={`font-bold mt-1 text-sm ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}
                            >
                              {task.title}
                            </h3>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setUploadTaskTarget(task);
                                setSelectedFile(null);
                                setPreviewUrl(null);
                              }}
                              className="cursor-pointer text-xs font-extrabold text-white bg-gradient-to-r from-sky-400 to-blue-500 hover:opacity-90 px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                            >
                              <Camera size={15} />
                              <span>{task.photo ? "更換作品" : "打卡作品"}</span>
                            </button>
                          </div>
                        </div>

                        {task.photo && (
                          <div className="mt-3 pt-3 border-t border-sky-100 flex items-center justify-between">
                            <span className="text-xs text-sky-600 font-medium flex items-center gap-1">
                              <ImageIcon size={14} /> 已上傳課堂作品！點擊可放大
                            </span>
                            <img
                              src={task.photo}
                              alt="作品縮圖"
                              onClick={() => setPreviewItem(task)}
                              className="w-12 h-12 object-cover rounded-xl border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>

                      {isMilestoneTask &&
                        milestoneReward &&
                        taskFilter === "all" && (
                          <div
                            onClick={() => setActiveTab("rewards")}
                            className={`mt-2 mb-4 px-4 py-2.5 rounded-xl border border-dashed flex items-center justify-between cursor-pointer transition ${completedCount >= milestoneReward.requiredTasks ? "bg-amber-50/60 border-amber-300 text-amber-800" : "bg-slate-50 border-slate-200 text-slate-400"}`}
                          >
                            <div className="flex items-center gap-2 text-xs font-bold">
                              <Gift
                                size={15}
                                className={
                                  completedCount >=
                                  milestoneReward.requiredTasks
                                    ? "text-amber-500"
                                    : "text-slate-300"
                                }
                              />
                              <span>
                                階段獎勵 {milestoneReward.id}：
                                {milestoneReward.title}
                              </span>
                            </div>
                            <span className="text-[11px] font-extrabold underline">
                              {completedCount >= milestoneReward.requiredTasks
                                ? "去領獎 👉"
                                : `需完成 ${milestoneReward.requiredTasks} 堂`}
                            </span>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "rewards" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-extrabold text-slate-700 flex items-center gap-2">
                  <Trophy className="text-amber-500" size={20} /> 6 大里程碑獎品
                </h2>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  每完成 4 堂解鎖 1 個
                </span>
              </div>

              <div className="space-y-3">
                {REWARDS.map((reward) => {
                  const isUnlocked = completedCount >= reward.requiredTasks;
                  const isClaimed = claimedRewards.includes(reward.id);

                  return (
                    <div
                      key={reward.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${isUnlocked ? "bg-amber-50/50 border-amber-200 shadow-sm" : "bg-slate-50 border-slate-100 opacity-70"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2.5 rounded-xl shrink-0 ${isUnlocked ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-400"}`}
                        >
                          <Gift size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-extrabold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                              獎品 #{reward.id}
                            </span>
                            <span className="text-xs font-bold text-amber-600">
                              {reward.milestone} ({completedCount}/
                              {reward.requiredTasks})
                            </span>
                          </div>
                          <div className="font-bold text-slate-700 text-sm mt-1">
                            {reward.title}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                            {reward.desc}
                          </p>
                        </div>
                      </div>

                      <button
                        disabled={!isUnlocked}
                        onClick={() => handleClaimReward(reward)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${isClaimed ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : isUnlocked ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm hover:opacity-95 active:scale-95 animate-pulse" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
                      >
                        {isClaimed
                          ? "查看兌換券"
                          : isUnlocked
                            ? "立即領取 🎁"
                            : `差 ${reward.requiredTasks - completedCount} 堂`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "gallery" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-extrabold text-slate-700 flex items-center gap-2">
                  <Palette className="text-sky-400" size={20} /> 個人作品展覽館
                </h2>
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full">
                  共 {uploadedArtworks.length} / 24 幅作品
                </span>
              </div>

              {uploadedArtworks.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center my-4">
                  <div className="bg-sky-100 text-sky-500 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <ImageIcon size={28} />
                  </div>
                  <h3 className="font-bold text-slate-600 text-base">
                    溫柔畫廊仲未有作品呀 🎨
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    完成課堂之後，撳任務隔離嘅「打卡作品」上傳畫作，呢度就會自動變成你嘅
                    24 堂專屬展覽館㗎啦！
                  </p>
                  <button
                    onClick={() => setActiveTab("quests")}
                    className="mt-4 bg-sky-400 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
                  >
                    去課堂任務打卡 👉
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  {uploadedArtworks.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => setPreviewItem(art)}
                      className="bg-white border border-slate-100 rounded-2xl p-2.5 shadow-sm hover:shadow-md hover:border-sky-200 transition cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2.5 relative">
                          <img
                            src={art.photo}
                            alt={art.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <span className="absolute top-2 left-2 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            第 {art.id} 堂
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-700 text-xs line-clamp-2 leading-snug px-1">
                          {art.title}
                        </h3>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 px-1">
                        <span className="text-[10px] text-slate-400">
                          {art.uploadDate ? `${art.uploadDate} 作品` : "已收藏"}
                        </span>
                        <Heart
                          size={13}
                          className="text-sky-400 fill-sky-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 📸 溫柔風格的「上傳打卡作品」Popup 視窗 */}
        {uploadTaskTarget && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-50 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl p-6 text-center space-y-4 relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => {
                  setUploadTaskTarget(null);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-400 p-2 rounded-full transition"
              >
                <X size={18} />
              </button>

              <div className="bg-sky-50 text-sky-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Camera size={32} />
              </div>

              <div>
                <span className="text-[11px] font-bold text-sky-500 bg-sky-50 px-2.5 py-0.5 rounded-md">
                  {uploadTaskTarget.category}
                </span>
                <h3 className="text-xl font-black text-slate-700 mt-1">
                  打卡上傳：{uploadTaskTarget.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  請選擇或拍攝你嘅今日畫作相片 📸✨
                </p>
              </div>

              {/* 預覽區域 */}
              {previewUrl ? (
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-sky-100 shadow-sm">
                  <img src={previewUrl} alt="預覽圖片" className="w-full h-full object-cover" />
                </div>
              ) : (
                <label className="border-2 border-dashed border-sky-200 hover:border-sky-400 bg-sky-50/30 hover:bg-sky-50/60 aspect-video w-full rounded-2xl flex flex-col items-center justify-center cursor-pointer transition gap-2">
                  <UploadCloud size={32} className="text-sky-400" />
                  <span className="text-xs font-bold text-sky-600">點擊此處選擇相片檔案</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              )}

              {/* 按鈕操作區 */}
              <div className="space-y-2 pt-2">
                {previewUrl && (
                  <label className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1 transition">
                    重新選擇相片
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                )}

                <button
                  disabled={!selectedFile || isUploading}
                  onClick={confirmUpload}
                  className={`w-full py-3.5 rounded-2xl text-sm font-extrabold shadow-md transition flex items-center justify-center gap-2 ${
                    !selectedFile || isUploading
                      ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-sky-400 to-blue-500 text-white hover:opacity-95 active:scale-95 animate-pulse"
                  }`}
                >
                  {isUploading ? "正在上傳至雲端..." : "確認上傳打卡 🚀"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 兌換券 Modal */}
        {activeCoupon && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5 z-50">
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="bg-gradient-to-r from-amber-300 to-yellow-400 p-6 text-amber-950 text-center relative">
                <button
                  onClick={() => setActiveCoupon(null)}
                  className="absolute top-4 right-4 text-amber-900/60 hover:text-amber-950"
                >
                  <X size={20} />
                </button>
                <div className="bg-white/30 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                  <Gift size={36} className="text-amber-800" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider bg-black/10 px-3 py-1 rounded-full">
                  VIP 專屬獎勵兌換券 #{activeCoupon.id}
                </span>
                <h3 className="text-xl font-black mt-3">
                  {activeCoupon.title}
                </h3>
              </div>
              <div className="p-6 text-center space-y-5">
                <p className="text-slate-600 text-sm leading-relaxed">
                  {activeCoupon.desc}
                </p>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-3 bg-slate-50">
                  <div className="text-[11px] text-slate-400">兌換狀態</div>
                  <div className="text-sm font-bold text-sky-600 mt-0.5">
                    ✅ 已達成「{activeCoupon.milestone}」目標解鎖
                  </div>
                </div>
                <div className="space-y-2.5">
                  <a
                    href={`https://wa.me/${BOYFRIEND_PHONE}?text=${encodeURIComponent(`親愛嘅！我已經完成咗 ${activeCoupon.requiredTasks} 堂畫畫任務，成功解鎖第 ${activeCoupon.id} 個大獎【${activeCoupon.title}】啦！快啲同我兌換啦 🎉❤️`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-sky-400 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Send size={16} />
                    兌換方法
                  </a>
                  <button
                    onClick={() => setActiveCoupon(null)}
                    className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    稍後再兌換
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 預覽相片 Modal */}
        {previewItem && (
          <div
            onClick={() => setPreviewItem(null)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-5 z-50"
          >
            <div
              className="max-w-sm w-full bg-white p-3 rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={previewItem.photo}
                  alt={previewItem.title}
                  className="w-full max-h-[65vh] object-contain rounded-2xl bg-slate-50"
                />
                <button
                  onClick={() => setPreviewItem(null)}
                  className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-3 text-center">
                <span className="text-[11px] font-bold text-sky-500 bg-sky-50 px-2.5 py-0.5 rounded-md">
                  {previewItem.category}
                </span>
                <h3 className="font-extrabold text-slate-700 text-base mt-1.5">
                  {previewItem.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1">
                  <Heart size={13} className="text-sky-400 fill-sky-400" />{" "}
                  溫柔畫廊珍藏作品
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}