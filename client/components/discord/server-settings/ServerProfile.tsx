import { useRef, useState } from 'react';

const ServerProfile = () => {
  const [name, setName] = useState('NanoTech');
  const [handle, setHandle] = useState('examplename');
  const [description, setDescription] = useState(
    "Welcome to the Future! Join our Telegram group to explore the world of nanotechnology — breakthroughs, research, innovations, and discussions. Whether you're a scientist, student, or tech enthusiast, let's dive into the tiny tech shaping our tomorrow! #Nanotech #Science #Innovation"
  );

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [slowMode, setSlowMode] = useState(50); // 0-100 for slider
  const [showMemberList, setShowMemberList] = useState(true);
  const [allowEmoji, setAllowEmoji] = useState(true);
  const [viewCount, setViewCount] = useState(false);
  const [restrictVoters, setRestrictVoters] = useState(false);
  const [accessType] = useState('Public');
  const [monetization] = useState('Free');
  const [visibility, setVisibility] = useState<'visible' | 'hidden'>('visible');

  const onChooseAvatar = () => fileInputRef.current?.click();
  const onAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  };

  const slowModeOptions = ['None', '10s', '30s', '1m', '5m', '15m', '1h'];

  return (
    <div className="w-full h-full flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-[480px] px-4 py-10">
        <div className="flex flex-col items-center gap-6">
          {/* Avatar */}
          <button
            type="button"
            onClick={() => setIsAvatarEditorOpen(true)}
            className="relative w-28 h-28 rounded-2xl bg-gradient-to-l from-purple to-darkPurple flex items-center justify-center shadow-avatar-shadow overflow-hidden focus:outline-none"
            aria-label="Edit server avatar"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Server avatar" className="w-full h-full object-cover" />
            ) : (
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M37.2322 39.9995H38.2126C40.5122 39.9995 42.3414 38.9517 43.9838 37.4867C48.156 33.7647 38.3482 29.9995 35 29.9995M31 10.1371C31.4542 10.047 31.9258 9.99951 32.4096 9.99951C36.0494 9.99951 39 12.6858 39 15.9995C39 19.3132 36.0494 21.9995 32.4096 21.9995C31.9258 21.9995 31.4542 21.9521 31 21.8619" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                <path d="M8.96262 32.2224C6.60468 33.486 0.422277 36.0662 4.18776 39.2948C6.02718 40.872 8.07582 42 10.6514 42H25.3486C27.9242 42 29.9728 40.872 31.8122 39.2948C35.5778 36.0662 29.3954 33.486 27.0374 32.2224C21.508 29.2592 14.492 29.2592 8.96262 32.2224Z" stroke="white" strokeWidth="4"/>
                <path d="M26 15C26 19.4183 22.4182 23 18 23C13.5817 23 10 19.4183 10 15C10 10.5817 13.5817 7 18 7C22.4182 7 26 10.5817 26 15Z" stroke="white" strokeWidth="4"/>
              </svg>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="px-3 py-1 rounded-full border border-white/30 text-white text-sm">Edit</span>
            </div>
          </button>

          {/* Name */}
          <label className="w-full">
            <span className="sr-only">Server name</span>
            <div className="flex items-center gap-3 px-4 h-12 w-full rounded-full border border-[#181B22] bg-[#0C1014]/50">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white text-[15px] font-medium"
                placeholder="Server name"
              />
            </div>
          </label>

          {/* Handle & Link */}
          <div className="flex flex-col gap-2.5 w-full">
            <label className="w-full">
              <span className="sr-only">Server handle</span>
              <div className="flex items-center gap-2 px-4 h-12 rounded-full border border-[#181B22] bg-[#0C1014]/50">
                <input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white text-[15px] font-medium"
                  placeholder="handle"
                />
              </div>
            </label>
            <p className="text-[12px] font-bold">
              <span className="text-[#B0B0B0]">Your link will look like: </span>
              <span className="text-purple">https://tyriantrade.com/{handle}</span>
            </p>
            <button className="h-11 rounded-full bg-gradient-to-l from-purple to-darkPurple text-white text-[15px] font-bold px-6">
              Share
            </button>
          </div>

          {/* Description */}
          <div className="w-full">
            <label className="block text-white text-[12px] font-bold mb-2">Channel description</label>
            <div className="px-4 py-3 rounded-2xl border border-[#181B22] bg-[#0C1014]/40">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-transparent outline-none text-white text-[15px] resize-y min-h-[200px]"
              />
              <div className="text-right text-xs text-[#B0B0B0]">{description.length} characters</div>
            </div>
          </div>

          {/* Slow Mode */}
          <div className="flex flex-col gap-3 w-full rounded-xl">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_346_2757)">
                  <path d="M9.99967 18.3332C14.602 18.3332 18.333 14.6022 18.333 9.99984C18.333 5.39746 14.602 1.6665 9.99967 1.6665C6.26827 1.6665 3.14489 4.11891 2.08301 7.49984H4.16634" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 6.6665V9.99984L11.6667 11.6665" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1.66699 10C1.66699 10.2811 1.67966 10.5591 1.70444 10.8333M7.50033 18.3333C7.21566 18.2397 6.93758 18.1303 6.66699 18.0065M2.67482 14.1667C2.51412 13.857 2.37077 13.5361 2.24613 13.2052M4.02634 16.0887C4.28108 16.3632 4.55288 16.6201 4.83995 16.8577" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </svg>
              <span className="text-white text-[15px] font-bold">Slow mode</span>
            </div>

            <div className="flex justify-between items-center">
              {slowModeOptions.map((option) => (
                <span key={option} className="text-[#B0B0B0] text-[12px] font-bold">{option}</span>
              ))}
            </div>

            <div className="relative w-full h-5">
              <div className="absolute top-2 w-full h-0.5 rounded-full bg-[#181B22]" />
              <div
                className="absolute top-2 h-0.5 rounded-full bg-gradient-to-l from-purple to-darkPurple"
                style={{ width: `${slowMode}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={slowMode}
                onChange={(e) => setSlowMode(Number(e.target.value))}
                className="absolute top-0 w-full h-5 opacity-0 cursor-pointer"
              />
              <div
                className="absolute top-0 w-4 h-4 rounded-full bg-white"
                style={{ left: `calc(${slowMode}% - 8px)` }}
              />
            </div>

            <p className="text-[#B0B0B0] text-[12px] font-bold">
              Participants will not be able to send more than one message every 1 minute.
            </p>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-4 w-full">
            {/* Show member list */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.9163 9.16667C12.9163 7.55583 11.6105 6.25 9.99967 6.25C8.38884 6.25 7.08301 7.55583 7.08301 9.16667C7.08301 10.7775 8.38884 12.0833 9.99967 12.0833C11.6105 12.0833 12.9163 10.7775 12.9163 9.16667Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12.9022 9.45825C13.1705 9.53958 13.4551 9.58333 13.7499 9.58333C15.3607 9.58333 16.6666 8.2775 16.6666 6.66667C16.6666 5.05583 15.3607 3.75 13.7499 3.75C12.2375 3.75 10.9939 4.90117 10.8477 6.37511" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.15192 6.37511C9.00567 4.90117 7.76211 3.75 6.24967 3.75C4.63884 3.75 3.33301 5.05583 3.33301 6.66667C3.33301 8.2775 4.63884 9.58333 6.24967 9.58333C6.54452 9.58333 6.82913 9.53958 7.0974 9.45825" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.3333 13.7502C18.3333 11.449 16.2813 9.5835 13.75 9.5835" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14.5837 16.2502C14.5837 13.949 12.5317 12.0835 10.0003 12.0835C7.46902 12.0835 5.41699 13.949 5.41699 16.2502" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.25033 9.5835C3.71902 9.5835 1.66699 11.449 1.66699 13.7502" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-white text-[15px] font-bold">Show member list</span>
              </div>
              <button
                onClick={() => setShowMemberList(!showMemberList)}
                className={`w-[46px] h-6 rounded-full p-0.5 flex items-center transition-all ${
                  showMemberList ? 'bg-gradient-to-l from-purple to-darkPurple justify-end' : 'bg-[#523A83] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white" />
              </button>
            </div>

            {/* Allow emoji & reactions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.2192 3.32846C13.9844 1.95769 12.034 2.51009 10.8623 3.39001C10.3818 3.7508 10.1417 3.93119 10.0003 3.93119C9.85899 3.93119 9.61882 3.7508 9.13832 3.39001C7.96667 2.51009 6.01623 1.95769 3.78152 3.32846C0.848716 5.12745 0.185092 11.0624 6.94993 16.0695C8.23842 17.0232 8.88266 17.5 10.0003 17.5C11.118 17.5 11.7622 17.0232 13.0507 16.0695C19.8156 11.0624 19.1519 5.12745 16.2192 3.32846Z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="text-white text-[15px] font-bold">Allow emoji & reactions</span>
              </div>
              <button
                onClick={() => setAllowEmoji(!allowEmoji)}
                className={`w-[46px] h-6 rounded-full p-0.5 flex items-center transition-all ${
                  allowEmoji ? 'bg-gradient-to-l from-purple to-darkPurple justify-end' : 'bg-[#523A83] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white" />
              </button>
            </div>

            {/* View count */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.5137 16.6665H15.9222C16.8804 16.6665 17.6426 16.2299 18.3269 15.6195C20.0653 14.0687 15.9787 12.4998 14.5837 12.4998M12.917 4.22381C13.1062 4.18628 13.3027 4.1665 13.5043 4.1665C15.0209 4.1665 16.2503 5.2858 16.2503 6.6665C16.2503 8.04721 15.0209 9.1665 13.5043 9.1665C13.3027 9.1665 13.1062 9.14675 12.917 9.10917" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M3.73443 13.426C2.75195 13.9525 0.175949 15.0276 1.7449 16.3728C2.51133 17.03 3.36493 17.5 4.4381 17.5H10.5619C11.6351 17.5 12.4887 17.03 13.2551 16.3728C14.8241 15.0276 12.2481 13.9525 11.2656 13.426C8.96167 12.1913 6.03833 12.1913 3.73443 13.426Z" stroke="white" strokeWidth="1.5"/>
                  <path d="M10.8337 6.24984C10.8337 8.09079 9.34124 9.58317 7.50033 9.58317C5.65938 9.58317 4.16699 8.09079 4.16699 6.24984C4.16699 4.40889 5.65938 2.9165 7.50033 2.9165C9.34124 2.9165 10.8337 4.40889 10.8337 6.24984Z" stroke="white" strokeWidth="1.5"/>
                </svg>
                <span className="text-white text-[15px] font-bold">View count</span>
              </div>
              <button
                onClick={() => setViewCount(!viewCount)}
                className={`w-[46px] h-6 rounded-full p-0.5 flex items-center transition-all ${
                  viewCount ? 'bg-gradient-to-l from-purple to-darkPurple justify-end' : 'bg-[#523A83] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white" />
              </button>
            </div>

            {/* Restrict voters */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.0833 6.66667C12.0833 4.36548 10.2178 2.5 7.91667 2.5C5.61548 2.5 3.75 4.36548 3.75 6.66667C3.75 8.96783 5.61548 10.8333 7.91667 10.8333C10.2178 10.8333 12.0833 8.96783 12.0833 6.66667Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.08301 16.6668C2.08301 13.4452 4.69468 10.8335 7.91634 10.8335C8.81101 10.8335 9.65859 11.0349 10.4163 11.3948" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12.958 12.5415L17.0413 16.6248M17.9163 14.5832C17.9163 12.9723 16.6105 11.6665 14.9997 11.6665C13.3888 11.6665 12.083 12.9723 12.083 14.5832C12.083 16.194 13.3888 17.4998 14.9997 17.4998C16.6105 17.4998 17.9163 16.194 17.9163 14.5832Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-white text-[15px] font-bold">Restrict voters</span>
              </div>
              <button
                onClick={() => setRestrictVoters(!restrictVoters)}
                className={`w-[46px] h-6 rounded-full p-0.5 flex items-center transition-all ${
                  restrictVoters ? 'bg-gradient-to-l from-purple to-darkPurple justify-end' : 'bg-[#523A83] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white" />
              </button>
            </div>
          </div>

          {/* Visibility */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-white text-[12px] font-bold">Visibility</label>
            <div className="flex gap-2.5">
              <button
                onClick={() => setVisibility('visible')}
                className={`flex-1 h-11 rounded-full text-[15px] font-bold transition-all px-4 ${
                  visibility === 'visible'
                    ? 'bg-gradient-to-l from-purple to-darkPurple text-white'
                    : 'border border-[#181B22] bg-[#0C1014]/50 text-[#B0B0B0]'
                }`}
              >
                Visible in search
              </button>
              <button
                onClick={() => setVisibility('hidden')}
                className={`flex-1 h-11 rounded-full text-[15px] font-bold transition-all px-4 ${
                  visibility === 'hidden'
                    ? 'bg-gradient-to-l from-purple to-darkPurple text-white'
                    : 'border border-[#181B22] bg-[#0C1014]/50 text-[#B0B0B0]'
                }`}
              >
                Hidden
              </button>
            </div>
          </div>

          {/* Save Changes Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Prevent any native or immediate propagation that could click underlying items
              // @ts-ignore
              if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
                // @ts-ignore
                e.nativeEvent.stopImmediatePropagation();
              }
              const detail = { name, handle, description, avatarUrl };
              window.dispatchEvent(new CustomEvent('server-profile:save', { detail }));
            }}
            className="w-full h-11 rounded-full border border-[#181B22] text-[#B0B0B0] text-[15px] font-bold hover:bg-[#181B22]/50 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Avatar Editor Modal */}
      {isAvatarEditorOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md mx-4 rounded-2xl border border-[#181B22] bg-[#0C1014]/80 backdrop-blur-xl p-6 flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg">Edit server photo</h3>
            <div className="w-40 h-40 rounded-2xl overflow-hidden self-center border border-[#181B22] bg-[#0C1014] flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Server avatar preview" className="w-full h-full object-cover" />
              ) : (
                <svg width="64" height="64" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M37.2322 39.9995H38.2126C40.5122 39.9995 42.3414 38.9517 43.9838 37.4867C48.156 33.7647 38.3482 29.9995 35 29.9995M31 10.1371C31.4542 10.047 31.9258 9.99951 32.4096 9.99951C36.0494 9.99951 39 12.6858 39 15.9995C39 19.3132 36.0494 21.9995 32.4096 21.9995C31.9258 21.9995 31.4542 21.9521 31 21.8619" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                  <path d="M8.96262 32.2224C6.60468 33.486 0.422277 36.0662 4.18776 39.2948C6.02718 40.872 8.07582 42 10.6514 42H25.3486C27.9242 42 29.9728 40.872 31.8122 39.2948C35.5778 36.0662 29.3954 33.486 27.0374 32.2224C21.508 29.2592 14.492 29.2592 8.96262 32.2224Z" stroke="white" strokeWidth="4"/>
                  <path d="M26 15C26 19.4183 22.4182 23 18 23C13.5817 23 10 19.4183 10 15C10 10.5817 13.5817 7 18 7C22.4182 7 26 10.5817 26 15Z" stroke="white" strokeWidth="4"/>
                </svg>
              )}
            </div>

            <div className="flex gap-2 justify-center">
              <button
                onClick={onChooseAvatar}
                className="rounded-full bg-gradient-to-l from-purple to-darkPurple text-white font-bold px-5 h-10"
              >
                Upload photo
              </button>
              {avatarUrl && (
                <button
                  onClick={() => setAvatarUrl(null)}
                  className="rounded-full border border-[#181B22] text-[#B0B0B0] font-bold px-5 h-10"
                >
                  Remove
                </button>
              )}
              <button
                onClick={() => setIsAvatarEditorOpen(false)}
                className="rounded-full border border-[#181B22] text-[#B0B0B0] font-bold px-5 h-10"
              >
                Close
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onAvatarFile}
              className="hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerProfile;
