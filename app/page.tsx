"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  ArrowLeft,
  Aperture,
  AtSign,
  Bookmark,
  CalendarDays,
  Camera,
  Check,
  Download,
  FileJson,
  Heart,
  Image as ImageIcon,
  MapPin,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Repeat2,
  Rows3,
  Save,
  Search,
  Send,
  Share2,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";

type SceneType = "chat" | "moments" | "profile" | "forum" | "x" | "instagram";
type Entry = {
  id: string;
  name: string;
  handle?: string;
  text: string;
  avatar?: string;
  media?: string;
  kind?: "message" | "marker";
  side?: "left" | "right";
  time?: string;
  likes?: string;
  replies?: string;
  reposts?: string;
  quotes?: string;
  views?: string;
};

type SceneData = {
  scene: SceneType;
  title: string;
  username: string;
  handle: string;
  bio: string;
  location: string;
  phoneTime: string;
  timestamp: string;
  caption: string;
  avatar: string;
  media: string;
  cover: string;
  likes: string;
  likedBy: string;
  replies: string;
  reposts: string;
  quotes: string;
  views: string;
  forumName: string;
  followers: string;
  following: string;
  entries: Entry[];
  accent: string;
  background: string;
  watermark: boolean;
};

type SceneMeta = {
  id: SceneType;
  label: string;
  kicker: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
};

type CropRequest = {
  url: string;
  label: string;
  aspect: number;
  circular: boolean;
  outputWidth: number;
  onApply: (value: string) => void;
};

const SCENES: SceneMeta[] = [
  { id: "chat", label: "捡手机", kicker: "聊天记录", icon: MessageCircle },
  { id: "moments", label: "朋友圈", kicker: "动态内容", icon: ImageIcon },
  { id: "profile", label: "X 主页档案", kicker: "账号主页", icon: UserRound },
  { id: "forum", label: "论坛体", kicker: "主楼回复", icon: Rows3 },
  { id: "x", label: "X 帖子", kicker: "推文串", icon: AtSign },
  { id: "instagram", label: "Instagram", kicker: "图片帖子", icon: Aperture },
];

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const BASE: Omit<SceneData, "scene"> = {
  title: "",
  username: "",
  handle: "",
  bio: "",
  location: "",
  phoneTime: "10:19",
  timestamp: "",
  caption: "",
  avatar: "",
  media: "",
  cover: "",
  likes: "",
  likedBy: "",
  replies: "",
  reposts: "",
  quotes: "",
  views: "",
  forumName: "",
  followers: "",
  following: "",
  accent: "#ffdb5b",
  background: "#aebfcc",
  watermark: true,
  entries: [],
};

const PRESETS: Array<{ id: string; scene: SceneType; name: string; tag: string; data: Partial<SceneData> }> = [
  {
    id: "blank-chat",
    scene: "chat",
    name: "空白聊天",
    tag: "捡手机版式",
    data: {
      background: "#aebfcc",
      accent: "#ffdf2f",
      entries: [
        { id: "c1", name: "", text: "", kind: "marker" },
        { id: "c2", name: "", text: "", kind: "message", side: "left", time: "" },
      ],
    },
  },
  {
    id: "blank-moment",
    scene: "moments",
    name: "空白动态",
    tag: "朋友圈版式",
    data: {
      entries: [{ id: "m1", name: "", text: "", time: "" }],
      accent: "#23ad74",
      background: "#f7f8f7",
    },
  },
  {
    id: "blank-profile",
    scene: "profile",
    name: "空白人物档案",
    tag: "朋友圈档案版式",
    data: {
      accent: "#1d9bd1",
      background: "#ffffff",
    },
  },
  {
    id: "blank-forum",
    scene: "forum",
    name: "空白论坛帖",
    tag: "主楼回复版式",
    data: {
      entries: [{ id: "f1", name: "", text: "", likes: "", time: "" }],
      accent: "#ffd72e",
      background: "#f5f5f3",
    },
  },
  {
    id: "blank-x",
    scene: "x",
    name: "空白帖子串",
    tag: "X 帖子版式",
    data: {
      entries: [{ id: "x1", name: "", handle: "", text: "", time: "", replies: "", reposts: "", likes: "" }],
      accent: "#1d9bf0",
      background: "#ffffff",
    },
  },
  {
    id: "blank-ins",
    scene: "instagram",
    name: "空白图片帖",
    tag: "Instagram 版式",
    data: {
      entries: [{ id: "i1", name: "", text: "", time: "" }],
      accent: "#d9365e",
      background: "#ffffff",
    },
  },
];

function presetToData(id: string): SceneData {
  const preset = PRESETS.find((item) => item.id === id) ?? PRESETS[0];
  return { ...BASE, ...preset.data, scene: preset.scene, entries: preset.data.entries ?? [] };
}

function BlueNames({ value }: { value: string }) {
  const names = value.split(";").map((name) => name.trim()).filter(Boolean);
  return <>{names.map((name, index) => <span key={`${name}-${index}`} className="blue-name">{index > 0 && <span className="name-separator">，</span>}{name}</span>)}</>;
}

function Avatar({ src, name, large = false, square = false }: { src?: string; name: string; large?: boolean; square?: boolean }) {
  return (
    <div className={`fake-avatar ${large ? "fake-avatar--large" : ""} ${square ? "fake-avatar--square" : ""}`}>
      {src ? <img src={src} alt="" /> : <span>{name.slice(0, 1).toUpperCase()}</span>}
    </div>
  );
}

function MediaBlock({ src, label = "上传图片后将在这里显示" }: { src?: string; label?: string }) {
  return src ? (
    <img className="media-block media-block--image" src={src} alt="用户上传的内容图片" />
  ) : (
    <div className="media-block media-placeholder">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <Sparkles size={26} />
      <span>{label}</span>
    </div>
  );
}

function ChatPreview({ data }: { data: SceneData }) {
  return (
    <div className="capture-page chat-page" style={{ background: data.background }}>
      <div className="phone-status"><span>{data.phoneTime}</span><span>◖◗ 5G ▰</span></div>
      <div className="chat-head"><ArrowLeft /><strong>{data.title}</strong><div className="head-actions"><Search size={21} /><Menu size={22} /></div></div>
      <div className="chat-stream">
        {data.entries.map((entry) => entry.kind === "marker" ? (
          <div className="date-pill" key={entry.id}>{entry.text}</div>
        ) : (
          <div className={`chat-row chat-row--${entry.side ?? "left"}`} key={entry.id}>
            {entry.side !== "right" && <Avatar src={entry.avatar} name={entry.name} />}
            <div className="bubble-wrap">
              {entry.side !== "right" && entry.name && <span className="sender-name">{entry.name}</span>}
              <div className="message-line">
                {entry.side === "right" && entry.time && <time>{entry.time}</time>}
                {entry.text && <div className="chat-bubble" style={entry.side === "right" ? { background: data.accent } : undefined}>{entry.text}</div>}
                {entry.side !== "right" && entry.time && <time>{entry.time}</time>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-compose"><Plus size={25} /><div /><span>☺</span></div>
      {data.watermark && <div className="sim-watermark">NETSCENE · FICTIONAL LAYOUT</div>}
    </div>
  );
}

function MomentsPreview({ data }: { data: SceneData }) {
  return (
    <div className="capture-page moments-page">
      <div className="phone-status moments-phone"><span>{data.phoneTime}</span><span>◖◗ 5G ▰</span></div>
      <div className="moments-cover" style={data.cover ? { backgroundImage: `url(${data.cover})` } : undefined}>
        <div className="moments-nav"><ArrowLeft /><span>动态</span><div><Repeat2 size={22} /><Camera size={22} /></div></div>
        <div className="profile-on-cover"><strong>{data.username}</strong><Avatar src={data.avatar} name={data.username} large /></div>
      </div>
      <div className="moment-post">
        <Avatar src={data.avatar} name={data.username} />
        <div className="moment-body">
          <strong>{data.username}</strong>
          <p>{data.caption}</p>
          <MediaBlock src={data.media} />
          <div className="moment-meta"><span>{data.timestamp}</span><MoreHorizontal size={20} /></div>
          <div className="moment-comments">
            {(data.likedBy || data.likes) && <div className="moment-likes"><Heart size={15} fill="#d84d58" strokeWidth={0} /> <span><BlueNames value={data.likedBy} />{data.likedBy && data.likes ? ` · ${data.likes} 人赞过` : data.likes}</span></div>}
            {data.entries.map((entry) => <div className="moment-comment-entry" key={entry.id}><p><strong>{entry.name}{entry.name && entry.text ? "：" : ""}</strong>{entry.text}{entry.time && <time>{entry.time}</time>}</p>{entry.media && <img className="comment-media" src={entry.media} alt="评论图片" />}</div>)}
          </div>
        </div>
      </div>
      <div className="moments-end">没有更多了</div>
      {data.watermark && <div className="sim-watermark">NETSCENE · FICTIONAL LAYOUT</div>}
    </div>
  );
}

function ProfilePreview({ data }: { data: SceneData }) {
  return (
    <div className="capture-page profile-page">
      <div className="phone-status"><span>{data.phoneTime}</span><span>◖◗ 5G ▰</span></div>
      <div className="x-profile-top"><ArrowLeft size={20} /><div><strong>{data.username || "个人资料"}</strong><span>{data.title || "0 帖子"}</span></div><MoreHorizontal size={20} /></div>
      <div className="x-cover profile-cover" style={data.cover ? { backgroundImage: `url(${data.cover})` } : undefined} />
      <div className="profile-main">
        <div className="profile-avatar-row"><Avatar src={data.avatar} name={data.username} large /><button>编辑个人资料</button></div>
        <h2>{data.username}</h2><span className="muted">{data.handle}</span>
        <p>{data.bio}</p>
        <div className="profile-meta"><span><MapPin size={15} /> {data.location}</span><span><CalendarDays size={15} /> {data.timestamp}</span></div>
        <div className="follow-row"><strong>{data.following}</strong> 正在关注　 <strong>{data.followers}</strong> 关注者</div>
      </div>
      <div className="x-profile-tabs"><strong>帖子</strong><span>回复</span><span>媒体</span><span>喜欢</span></div>
      <article className="profile-card">
        <div className="pinned-label">⌁ 置顶</div>
        <div className="x-author"><Avatar src={data.avatar} name={data.username} /><div><strong>{data.username} <span className="verified">✓</span></strong><span>{data.handle}</span></div><MoreHorizontal size={19} /></div>
        <p>{data.caption}</p>
        <MediaBlock src={data.media} label="主页置顶帖子图片" />
        <div className="tweet-time">{data.timestamp}{data.timestamp && data.views ? " · " : ""}{data.views && <><strong>{data.views}</strong> 次查看</>}</div>
        <MetricRow reply={data.replies} repost={data.reposts} like={data.likes} />
      </article>
      {data.watermark && <div className="sim-watermark">NETSCENE · FICTIONAL LAYOUT</div>}
    </div>
  );
}

function ForumPreview({ data }: { data: SceneData }) {
  return (
    <div className="capture-page forum-page">
      <div className="phone-status"><span>{data.phoneTime}</span><span>◖◗ 5G ▰</span></div>
      <div className="forum-nav"><ArrowLeft /><strong>{data.forumName}</strong><span><Share2 size={21} /> 分享</span></div>
      <article className="forum-topic">
        <div className="forum-author"><Avatar src={data.avatar} name={data.username} square /><strong>{data.username}</strong></div>
        <h1>{data.title}</h1><p>{data.caption}</p>
      </article>
      <h2 className="reply-title">回帖区 <small>{data.entries.length} 条回复</small></h2>
      <div className="reply-list">
        {data.entries.map((entry, index) => (
          <article className="forum-reply" key={entry.id}>
            <span className="floor">{index + 1}楼{entry.time ? ` · ${entry.time}` : ""}</span><strong>{entry.name}</strong><p>{entry.text}</p>
            {entry.media && <img className="comment-media" src={entry.media} alt="回帖图片" />}
            <span className="forum-like">♡ {entry.likes ?? 0}</span>
          </article>
        ))}
      </div>
      <div className="forum-input">回复 {data.username}： <Send size={18} /></div>
      {data.watermark && <div className="sim-watermark">NETSCENE · FICTIONAL LAYOUT</div>}
    </div>
  );
}

function MetricRow({ reply = "", repost = "", like = "" }: { reply?: string; repost?: string; like?: string }) {
  return <div className="metric-row"><span><MessageCircle size={17} />{reply}</span><span><Repeat2 size={17} />{repost}</span><span><Heart size={17} />{like}</span><span><Share2 size={17} /></span></div>;
}

function XPreview({ data }: { data: SceneData }) {
  return (
    <div className="capture-page x-page">
      <div className="phone-status"><span>{data.phoneTime}</span><span>◖◗ 5G ▰</span></div>
      <div className="x-top"><ArrowLeft size={21} /><strong>帖子</strong><MoreHorizontal size={21} /></div>
      <article className="main-tweet">
        <div className="x-author"><Avatar src={data.avatar} name={data.username} /><div><strong>{data.username} <span className="verified">✓</span></strong><span>{data.handle}</span></div><MoreHorizontal size={20} /></div>
        <p>{data.caption}</p><MediaBlock src={data.media} label="帖子媒体内容" />
        <div className="tweet-time">{data.timestamp}{data.timestamp && data.views ? " · " : ""}{data.views && <><strong>{data.views}</strong> 次查看</>}</div>
        <div className="tweet-stats"><strong>{data.reposts}</strong>{data.reposts && " 转帖　"}<strong>{data.quotes}</strong>{data.quotes && " 引用　"}<strong>{data.likes}</strong>{data.likes && " 喜欢"}</div>
        <MetricRow reply={data.replies} repost={data.reposts} like={data.likes} />
      </article>
      <div className="x-replies">
        {data.entries.map((entry) => (
          <article className="x-reply" key={entry.id}>
            <Avatar src={entry.avatar} name={entry.name} />
            <div><div className="reply-user"><strong>{entry.name}</strong> <span>{entry.handle}{entry.handle && entry.time ? " · " : ""}{entry.time}</span></div>{data.handle && <small>回复 <b>{data.handle}</b></small>}<p>{entry.text}</p>{entry.media && <img className="comment-media x-comment-media" src={entry.media} alt="回复图片" />}<MetricRow reply={entry.replies} repost={entry.reposts} like={entry.likes} /></div>
          </article>
        ))}
      </div>
      {data.watermark && <div className="sim-watermark">NETSCENE · FICTIONAL LAYOUT</div>}
    </div>
  );
}

function InstagramPreview({ data }: { data: SceneData }) {
  return (
    <div className="capture-page insta-page">
      <div className="phone-status"><span>{data.phoneTime}</span><span>◖◗ 5G ▰</span></div>
      <div className="insta-status"><Camera size={22} /><strong>Instagram</strong><Send size={22} /></div>
      <div className="stories"><div className="story"><Avatar src={data.avatar} name={data.username} /><span>{data.username}</span></div></div>
      <div className="insta-author"><Avatar src={data.avatar} name={data.username} /><div><strong>{data.username}</strong><span>{data.location}</span></div><MoreHorizontal size={20} /></div>
      <MediaBlock src={data.media} label="Instagram 帖子图片" />
      <div className="insta-actions"><div><Heart size={24} /><MessageCircle size={24} /><Send size={24} /></div><Bookmark size={24} /></div>
      <div className="insta-copy">{data.likes && <strong>{data.likes} 次赞</strong>}<p><b>{data.username}</b> {data.caption}</p>{data.entries.map((entry) => <div className="insta-comment" key={entry.id}><p><b>{entry.name}</b> {entry.text}{entry.time && <time>{entry.time}</time>}</p>{entry.media && <img className="comment-media" src={entry.media} alt="评论图片" />}</div>)}<span>{data.timestamp}</span></div>
      <div className="insta-tabs"><span>⌂</span><Search /><Plus /><Heart /><UserRound /></div>
      {data.watermark && <div className="sim-watermark">NETSCENE · FICTIONAL LAYOUT</div>}
    </div>
  );
}

function ScenePreview({ data }: { data: SceneData }) {
  if (data.scene === "chat") return <ChatPreview data={data} />;
  if (data.scene === "moments") return <MomentsPreview data={data} />;
  if (data.scene === "profile") return <ProfilePreview data={data} />;
  if (data.scene === "forum") return <ForumPreview data={data} />;
  if (data.scene === "x") return <XPreview data={data} />;
  return <InstagramPreview data={data} />;
}

function Field({ label, value, onChange, multiline = false, placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string }) {
  return <label className="field"><span>{label}</span>{multiline ? <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /> : <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}</label>;
}

function ImageCropModal({ request, onClose }: { request: CropRequest; onClose: () => void }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const viewportWidth = 360;
  const viewportHeight = viewportWidth / request.aspect;

  const rendered = () => {
    if (!imageSize.width || !imageSize.height) return null;
    const base = Math.max(viewportWidth / imageSize.width, viewportHeight / imageSize.height);
    const scale = base * zoom;
    const width = imageSize.width * scale;
    const height = imageSize.height * scale;
    return { width, height, left: (viewportWidth - width) / 2 + offset.x, top: (viewportHeight - height) / 2 + offset.y };
  };

  const apply = () => {
    const image = imageRef.current;
    const layout = rendered();
    if (!image || !layout) return;
    const canvas = document.createElement("canvas");
    canvas.width = request.outputWidth;
    canvas.height = Math.round(request.outputWidth / request.aspect);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const ratio = canvas.width / viewportWidth;
    ctx.drawImage(image, layout.left * ratio, layout.top * ratio, layout.width * ratio, layout.height * ratio);
    request.onApply(canvas.toDataURL("image/jpeg", 0.92));
    onClose();
  };

  return <div className="crop-backdrop" role="dialog" aria-modal="true" aria-label={`${request.label}裁剪`}>
    <div className="crop-modal">
      <div className="crop-modal-head"><div><small>图片编辑</small><strong>{request.label}</strong></div><button onClick={onClose} aria-label="关闭">×</button></div>
      <p>拖动图片调整位置，使用滑杆放大或缩小。确认后才会应用到画布。</p>
      <div
        className={`crop-viewport ${request.circular ? "crop-viewport--circle" : ""}`}
        style={{ aspectRatio: String(request.aspect) }}
        onPointerDown={(e) => { dragRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => { if (!dragRef.current) return; setOffset({ x: dragRef.current.ox + e.clientX - dragRef.current.x, y: dragRef.current.oy + e.clientY - dragRef.current.y }); }}
        onPointerUp={() => { dragRef.current = null; }}
        onPointerCancel={() => { dragRef.current = null; }}
      >
        <img
          ref={imageRef}
          src={request.url}
          alt="待裁剪图片"
          draggable={false}
          style={rendered() ?? undefined}
          onLoad={(e) => { setOffset({ x: 0, y: 0 }); setImageSize({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight }); }}
        />
        <div className="crop-grid" />
      </div>
      <label className="zoom-control"><span>缩放</span><input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} /><output>{Math.round(zoom * 100)}%</output></label>
      <div className="crop-actions"><button className="button" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>重置</button><div><button className="button" onClick={onClose}>取消</button><button className="button button-dark" onClick={apply}>应用图片</button></div></div>
    </div>
  </div>;
}

function UploadField({ label, value, onPick, onClear }: { label: string; value: string; onPick: (file: File) => void; onClear: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return <div className="upload-field"><span>{label}</span><div className="upload-actions"><button onClick={() => inputRef.current?.click()}><Upload size={15} />{value ? "重新裁剪" : "上传并裁剪"}</button>{value && <button className="ghost-mini" onClick={onClear}>清除</button>}</div><input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) onPick(file); e.currentTarget.value = ""; }} /></div>;
}

function Editor({ data, update, updateEntry, addEntry, removeEntry, openCrop }: {
  data: SceneData;
  update: <K extends keyof SceneData>(key: K, value: SceneData[K]) => void;
  updateEntry: (id: string, patch: Partial<Entry>) => void;
  addEntry: (kind?: Entry["kind"]) => void;
  removeEntry: (id: string) => void;
  openCrop: (file: File, options: Omit<CropRequest, "url">) => void;
}) {
  const isFeed = data.scene !== "chat";
  return <div className="editor-scroll">
    <div className="editor-section"><div className="section-heading"><span>基础信息</span><small>点击字段即可编辑</small></div>
      <Field label="手机状态栏时间" value={data.phoneTime} placeholder="例如 10:19" onChange={(v) => update("phoneTime", v)} />
      {data.scene === "forum" && <Field label="论坛名称" value={data.forumName} placeholder="例如 ××论坛" onChange={(v) => update("forumName", v)} />}
      {(data.scene === "chat" || data.scene === "forum") && <Field label="页面标题" value={data.title} onChange={(v) => update("title", v)} />}
      {data.scene === "profile" && <Field label="帖子数量" value={data.title} placeholder="例如 143 帖子" onChange={(v) => update("title", v)} />}
      {data.scene !== "chat" && <Field label="显示名称" value={data.username} onChange={(v) => update("username", v)} />}
      {(data.scene === "x" || data.scene === "profile") && <Field label="账号 ID" value={data.handle} onChange={(v) => update("handle", v)} />}
      {data.scene === "profile" && <Field label="个人简介" value={data.bio} multiline onChange={(v) => update("bio", v)} />}
      {(data.scene === "moments" || data.scene === "instagram" || data.scene === "profile") && <Field label="地点" value={data.location} onChange={(v) => update("location", v)} />}
      {isFeed && data.scene !== "profile" && <Field label="正文" value={data.caption} multiline onChange={(v) => update("caption", v)} />}
      {data.scene === "profile" && <Field label="置顶帖子正文" value={data.caption} multiline onChange={(v) => update("caption", v)} />}
      {data.scene !== "chat" && <Field label={data.scene === "profile" ? "加入时间" : "发布时间"} value={data.timestamp} onChange={(v) => update("timestamp", v)} />}
      {data.scene === "profile" && <div className="entry-grid"><Field label="正在关注" value={data.following} onChange={(v) => update("following", v)} /><Field label="关注者" value={data.followers} onChange={(v) => update("followers", v)} /></div>}
      {data.scene === "moments" && <><Field label="点赞用户" value={data.likedBy} placeholder="用英文分号 ; 分隔角色名称" onChange={(v) => update("likedBy", v)} /><Field label="点赞数量" value={data.likes} onChange={(v) => update("likes", v)} /></>}
      {data.scene === "instagram" && <Field label="点赞数量" value={data.likes} onChange={(v) => update("likes", v)} />}
      {(data.scene === "x" || data.scene === "profile") && <div className="metrics-editor"><Field label="回复数" value={data.replies} onChange={(v) => update("replies", v)} /><Field label="转发数" value={data.reposts} onChange={(v) => update("reposts", v)} /><Field label="引用数" value={data.quotes} onChange={(v) => update("quotes", v)} /><Field label="喜欢数" value={data.likes} onChange={(v) => update("likes", v)} /><Field label="查看次数" value={data.views} onChange={(v) => update("views", v)} /></div>}
    </div>
    <div className="editor-section"><div className="section-heading"><span>视觉素材</span><small>上传后可裁剪和缩放</small></div>
      {data.scene !== "chat" && <UploadField label="头像" value={data.avatar} onPick={(file) => openCrop(file, { label: "头像", aspect: 1, circular: data.scene !== "forum", outputWidth: 640, onApply: (v) => update("avatar", v) })} onClear={() => update("avatar", "")} />}
      {data.scene !== "chat" && data.scene !== "forum" && <UploadField label={data.scene === "profile" ? "置顶帖子图片" : "内容图片"} value={data.media} onPick={(file) => openCrop(file, { label: data.scene === "profile" ? "置顶帖子图片" : "内容图片", aspect: data.scene === "instagram" ? 1 : 4 / 5, circular: false, outputWidth: 1080, onApply: (v) => update("media", v) })} onClear={() => update("media", "")} />}
      {(data.scene === "moments" || data.scene === "profile") && <UploadField label="封面图" value={data.cover} onPick={(file) => openCrop(file, { label: "封面图", aspect: 16 / 9, circular: false, outputWidth: 1600, onApply: (v) => update("cover", v) })} onClear={() => update("cover", "")} />}
      <div className="color-row"><label><span>强调色</span><input type="color" value={data.accent} onChange={(e) => update("accent", e.target.value)} /></label><label><span>背景色</span><input type="color" value={data.background} onChange={(e) => update("background", e.target.value)} /></label></div>
      <label className="switch-row"><span><strong>虚构内容标识</strong><small>导出图底部的小型水印</small></span><input type="checkbox" checked={data.watermark} onChange={(e) => update("watermark", e.target.checked)} /></label>
    </div>
    {data.scene !== "profile" && <div className="editor-section"><div className="section-heading"><span>{data.scene === "chat" ? "聊天内容" : data.scene === "forum" ? "楼层回复" : "评论与回复"}</span><div className="section-actions">{data.scene === "chat" && <button onClick={() => addEntry("marker")}><Plus size={15} />时间/文字条</button>}<button onClick={() => addEntry("message")}><Plus size={15} />{data.scene === "chat" ? "消息" : "添加"}</button></div></div>
      <div className="entry-list">{data.entries.map((entry, index) => <div className="entry-card" key={entry.id}><div className="entry-card-head"><span>#{index + 1}</span><button onClick={() => removeEntry(entry.id)}><Trash2 size={15} /></button></div>
        {data.scene === "chat" && <label className="inline-select"><span>内容类型</span><select value={entry.kind ?? "message"} onChange={(e) => updateEntry(entry.id, { kind: e.target.value as Entry["kind"] })}><option value="message">聊天消息</option><option value="marker">时间 / 普通文字条</option></select></label>}
        {data.scene === "chat" && entry.kind === "marker" ? <textarea value={entry.text} aria-label="时间或文字条内容" placeholder="可输入日期、时间或普通文字" onChange={(e) => updateEntry(entry.id, { text: e.target.value })} /> : <>
          <div className="entry-grid"><input value={entry.name} aria-label="角色名" placeholder="角色名" onChange={(e) => updateEntry(entry.id, { name: e.target.value })} />{data.scene === "x" && <input value={entry.handle ?? ""} aria-label="账号 ID" placeholder="@handle" onChange={(e) => updateEntry(entry.id, { handle: e.target.value })} />}</div>
          {(data.scene === "chat" || data.scene === "x") && <UploadField label="这条内容的头像" value={entry.avatar ?? ""} onPick={(file) => openCrop(file, { label: `第 ${index + 1} 条头像`, aspect: 1, circular: true, outputWidth: 640, onApply: (v) => updateEntry(entry.id, { avatar: v }) })} onClear={() => updateEntry(entry.id, { avatar: "" })} />}
          <textarea value={entry.text} aria-label="内容" placeholder="输入内容" onChange={(e) => updateEntry(entry.id, { text: e.target.value })} />
          {data.scene !== "chat" && <UploadField label="评论图片（可选）" value={entry.media ?? ""} onPick={(file) => openCrop(file, { label: `第 ${index + 1} 条评论图片`, aspect: 4 / 3, circular: false, outputWidth: 1080, onApply: (v) => updateEntry(entry.id, { media: v }) })} onClear={() => updateEntry(entry.id, { media: "" })} />}
          {data.scene === "chat" && <div className="entry-options"><select value={entry.side ?? "left"} onChange={(e) => updateEntry(entry.id, { side: e.target.value as "left" | "right" })}><option value="left">对方消息</option><option value="right">我的消息</option></select><input value={entry.time ?? ""} placeholder="发送时间" onChange={(e) => updateEntry(entry.id, { time: e.target.value })} /></div>}
          {data.scene !== "chat" && <input className="wide-entry-input" value={entry.time ?? ""} placeholder="回复 / 评论时间" onChange={(e) => updateEntry(entry.id, { time: e.target.value })} />}
          {data.scene === "forum" && <input className="wide-entry-input" value={entry.likes ?? ""} placeholder="点赞数量" onChange={(e) => updateEntry(entry.id, { likes: e.target.value })} />}
          {data.scene === "x" && <div className="metrics-editor metrics-editor--entry"><input value={entry.replies ?? ""} placeholder="回复数" onChange={(e) => updateEntry(entry.id, { replies: e.target.value })} /><input value={entry.reposts ?? ""} placeholder="转发数" onChange={(e) => updateEntry(entry.id, { reposts: e.target.value })} /><input value={entry.likes ?? ""} placeholder="喜欢数" onChange={(e) => updateEntry(entry.id, { likes: e.target.value })} /></div>}
        </>}
      </div>)}</div>
    </div>}
  </div>;
}

export default function Home() {
  const [data, setData] = useState<SceneData>(() => presetToData("blank-chat"));
  const [savedAt, setSavedAt] = useState<string>("");
  const [exporting, setExporting] = useState(false);
  const [cropRequest, setCropRequest] = useState<CropRequest | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const saved = localStorage.getItem("netscene-current-v2") ?? localStorage.getItem("netscene-current");
      if (saved) {
        try {
          const restored = JSON.parse(saved) as Partial<SceneData>;
          setData({ ...BASE, ...restored, scene: restored.scene ?? "chat", entries: (restored.entries ?? []).map((entry) => ({ kind: "message", ...entry })) });
          setSavedAt("已恢复本地草稿");
        } catch { /* ignore malformed local draft */ }
      }
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  const activeMeta = useMemo(() => SCENES.find((s) => s.id === data.scene) ?? SCENES[0], [data.scene]);
  const update = <K extends keyof SceneData>(key: K, value: SceneData[K]) => setData((prev) => ({ ...prev, [key]: value }));
  const updateEntry = (id: string, patch: Partial<Entry>) => setData((prev) => ({ ...prev, entries: prev.entries.map((e) => e.id === id ? { ...e, ...patch } : e) }));
  const addEntry = (kind: Entry["kind"] = "message") => setData((prev) => ({ ...prev, entries: [...prev.entries, { id: makeId(), name: "", text: "", media: "", kind, side: "left", time: "", likes: "", replies: "", reposts: "" }] }));
  const removeEntry = (id: string) => setData((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }));
  const openCrop = (file: File, options: Omit<CropRequest, "url">) => setCropRequest({ ...options, url: URL.createObjectURL(file) });
  const closeCrop = () => setCropRequest((current) => { if (current) URL.revokeObjectURL(current.url); return null; });

  const saveLocal = () => {
    localStorage.setItem("netscene-current-v2", JSON.stringify(data));
    setSavedAt(`已保存 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`);
  };
  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `netscene-${data.scene}.json`; a.click(); URL.revokeObjectURL(url);
  };
  const importJson = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { try { const restored = JSON.parse(String(reader.result)) as Partial<SceneData>; setData({ ...BASE, ...restored, scene: restored.scene ?? "chat", entries: (restored.entries ?? []).map((entry) => ({ kind: "message", ...entry })) }); setSavedAt("已导入档案"); } catch { setSavedAt("档案格式不正确"); } };
    reader.readAsText(file);
  };
  const exportPng = async () => {
    if (!captureRef.current) return;
    setExporting(true);
    try {
      const url = await toPng(captureRef.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement("a"); a.href = url; a.download = `netscene-${data.scene}-${Date.now()}.png`; a.click();
      setSavedAt("PNG 已导出");
    } catch { setSavedAt("导出失败，请更换较小的图片后重试"); }
    finally { setExporting(false); }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark">N</div><div><strong>NetScene</strong><span>社交内容模拟器</span></div><em>BETA</em></div>
        <div className="topbar-center"><span className="status-dot"><Check size={13} />{savedAt || "本地草稿 · 未保存"}</span></div>
        <div className="topbar-actions"><button className="button button-ghost" onClick={() => importRef.current?.click()}><Upload size={16} />导入</button><button className="button button-ghost" onClick={saveLocal}><Save size={16} />保存</button><button className="button button-dark" disabled={exporting} onClick={exportPng}><Download size={16} />{exporting ? "生成中…" : "导出 PNG"}</button><input ref={importRef} type="file" hidden accept="application/json" onChange={(e) => importJson(e.target.files?.[0])} /></div>
      </header>
      <div className="studio-grid">
        <aside className="scene-sidebar">
          <nav className="scene-nav">
            {SCENES.map((scene) => { const Icon = scene.icon; return <button className={data.scene === scene.id ? "active" : ""} key={scene.id} onClick={() => setData((prev) => ({ ...presetToData(PRESETS.find((p) => p.scene === scene.id)?.id ?? PRESETS[0].id), avatar: prev.avatar }))}><Icon size={19} /><span><strong>{scene.label}</strong><small>{scene.kicker}</small></span>{data.scene === scene.id && <i />}</button>; })}
          </nav>
          <button className="json-button sidebar-json" onClick={exportJson}><FileJson size={16} />导出可继续编辑的 JSON</button>
          <div className="sidebar-footer"><Sparkles size={16} /><span>所有内容默认仅保存在你的浏览器中</span></div>
        </aside>
        <section className="editor-panel">
          <div className="panel-title"><div><span>内容编辑</span><h2>{activeMeta.label}</h2></div><span className="autosave-label">实时预览</span></div>
          <Editor data={data} update={update} updateEntry={updateEntry} addEntry={addEntry} removeEntry={removeEntry} openCrop={openCrop} />
        </section>
        <section className="preview-stage">
          <div className="preview-heading"><div><span>EXPORT PREVIEW</span><strong>1080 × 长图</strong></div><div className="zoom-pill">100%</div></div>
          <div className="phone-shadow"><div className="capture-wrap" ref={captureRef}><ScenePreview data={data} /></div></div>
          <div className="preview-note"><span><Check size={14} />内容可直接导出为高清 PNG</span><span>建议单张上传图片小于 5MB</span></div>
        </section>
      </div>
      {cropRequest && <ImageCropModal request={cropRequest} onClose={closeCrop} />}
    </main>
  );
}
