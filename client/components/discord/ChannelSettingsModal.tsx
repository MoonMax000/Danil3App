import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';

interface ChannelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChannelSettingsModal = ({ isOpen, onClose }: ChannelSettingsModalProps) => {
  const [channelName, setChannelName] = useState('NanoTech');
  const [username, setUsername] = useState('examplename');
  const [description, setDescription] = useState('Welcome to the Future!     Join our Telegram group to explore the world of nanotechnology — breakthroughs, research, innovations, and discussions. Whether you\'re a scientist, student, or tech enthusiast, let\'s dive into the tiny tech shaping our tomorrow!     #Nanotech #Science #Innovation');
  const [slowMode, setSlowMode] = useState(50); // percentage of slider
  const [showMemberList, setShowMemberList] = useState(true);
  const [allowEmoji, setAllowEmoji] = useState(true);
  const [viewCount, setViewCount] = useState(false);
  const [restrictVoters, setRestrictVoters] = useState(false);
  const [visibility, setVisibility] = useState<'visible' | 'hidden'>('visible');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col w-[440px] max-h-[90vh] pt-12 px-4 pb-4 gap-6 rounded-r-3xl border border-[#181B22] custom-bg-blur overflow-y-auto scrollbar">
        {/* Channel Icon */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center w-24 h-24 rounded-lg bg-gradient-to-l from-purple to-darkPurple relative">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M37.2322 39.9995H38.2126C40.5122 39.9995 42.3414 38.9517 43.9838 37.4867C48.156 33.7647 38.3482 29.9995 35 29.9995M31 10.1371C31.4542 10.047 31.9258 9.99951 32.4096 9.99951C36.0494 9.99951 39 12.6858 39 15.9995C39 19.3132 36.0494 21.9995 32.4096 21.9995C31.9258 21.9995 31.4542 21.9521 31 21.8619" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                <path d="M8.96262 32.2224C6.60468 33.486 0.422277 36.0662 4.18776 39.2948C6.02718 40.872 8.07582 42 10.6514 42H25.3486C27.9242 42 29.9728 40.872 31.8122 39.2948C35.5778 36.0662 29.3954 33.486 27.0374 32.2224C21.508 29.2592 14.492 29.2592 8.96262 32.2224Z" stroke="white" strokeWidth="4"/>
                <path d="M26 15C26 19.4183 22.4182 23 18 23C13.5817 23 10 19.4183 10 15C10 10.5817 13.5817 7 18 7C22.4182 7 26 10.5817 26 15Z" stroke="white" strokeWidth="4"/>
              </svg>
              
              {/* Edit Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(24,26,32,0.64)] backdrop-blur-[2px] rounded-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.0737 3.88545C14.8189 3.07808 15.1915 2.6744 15.5874 2.43893C16.5427 1.87076 17.7191 1.85309 18.6904 2.39232C19.0929 2.6158 19.4769 3.00812 20.245 3.79276C21.0131 4.5774 21.3972 4.96972 21.6159 5.38093C22.1438 6.37312 22.1265 7.57479 21.5703 8.5507C21.3398 8.95516 20.9446 9.33578 20.1543 10.097L10.7506 19.1543C9.25288 20.5969 8.504 21.3182 7.56806 21.6837C6.63212 22.0493 5.6032 22.0224 3.54536 21.9686L3.26538 21.9613C2.63891 21.9449 2.32567 21.9367 2.14359 21.73C1.9615 21.5234 1.98636 21.2043 2.03608 20.5662L2.06308 20.2197C2.20301 18.4235 2.27297 17.5255 2.62371 16.7182C2.97444 15.9109 3.57944 15.2555 4.78943 13.9445L14.0737 3.88545Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M13 4L20 11" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M14 22H22" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Channel Name */}
          <div className="flex items-center gap-2.5 px-4 py-4 w-full rounded-xl border border-[#181B22]">
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="flex-1 text-[15px] font-normal text-white bg-transparent outline-none"
            />
          </div>

          {/* Username/Link */}
          <div className="flex flex-col gap-2.5 w-full">
            <div className="flex items-center gap-2 w-full">
              <div className="flex items-center px-4 py-3 flex-1 rounded-xl border border-[#181B22] custom-bg-blur">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 text-[15px] font-normal text-white bg-transparent outline-none"
                />
              </div>
            </div>
            <p className="text-xs font-bold text-[#B0B0B0]">
              Your link will look like: <span className="text-purple">https://tyriantrade.com/{username}</span>
            </p>
            <button className="flex items-center justify-center h-[26px] px-4 py-2.5 rounded-lg bg-gradient-to-l from-purple to-darkPurple">
              <span className="text-[15px] font-bold text-white">Share</span>
            </button>
          </div>

          {/* Description */}
          <div className="flex items-start px-4 py-4 w-full rounded-xl border border-[#181B22]">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 text-[15px] font-normal text-white bg-transparent outline-none resize-none min-h-[100px]"
            />
          </div>

          {/* Slow Mode */}
          <div className="flex flex-col gap-2.5 w-full rounded-xl">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_346_2757)">
                  <path d="M9.99967 18.3332C14.602 18.3332 18.333 14.6022 18.333 9.99984C18.333 5.39746 14.602 1.6665 9.99967 1.6665C6.26827 1.6665 3.14489 4.11891 2.08301 7.49984H4.16634" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 6.6665V9.99984L11.6667 11.6665" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1.66699 10C1.66699 10.2811 1.67966 10.5591 1.70444 10.8333M7.50033 18.3333C7.21566 18.2397 6.93758 18.1303 6.66699 18.0065M2.67482 14.1667C2.51412 13.857 2.37077 13.5361 2.24613 13.2052M4.02634 16.0887C4.28108 16.3632 4.55288 16.6201 4.83995 16.8577" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </svg>
              <span className="text-[15px] font-bold text-white">Slow mode</span>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-xs font-bold text-[#B0B0B0]">
                <span>None</span>
                <span>10s</span>
                <span>30s</span>
                <span>1m</span>
                <span>5m</span>
                <span>15m</span>
                <span>1h</span>
              </div>
              
              <div className="relative w-full h-4">
                <div className="absolute top-[7px] w-full h-0.5 rounded-full bg-[#181B22]" />
                <div 
                  className="absolute top-[7px] h-0.5 rounded-full bg-gradient-to-l from-purple to-darkPurple"
                  style={{ width: `${slowMode}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={slowMode}
                  onChange={(e) => setSlowMode(Number(e.target.value))}
                  className="absolute top-0 w-full h-4 opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute top-0 w-4 h-4 rounded-full bg-white"
                  style={{ left: `calc(${slowMode}% - 8px)` }}
                />
              </div>

              <p className="text-xs font-bold text-[#B0B0B0]">
                Participants will not be able to send more than one message every 1 minute.
              </p>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-4 w-full">
            {/* Show member list */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.9163 9.16667C12.9163 7.55583 11.6105 6.25 9.99967 6.25C8.38884 6.25 7.08301 7.55583 7.08301 9.16667C7.08301 10.7775 8.38884 12.0833 9.99967 12.0833C11.6105 12.0833 12.9163 10.7775 12.9163 9.16667Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12.9022 9.45825C13.1705 9.53958 13.4551 9.58333 13.7499 9.58333C15.3607 9.58333 16.6666 8.2775 16.6666 6.66667C16.6666 5.05583 15.3607 3.75 13.7499 3.75C12.2375 3.75 10.9939 4.90117 10.8477 6.37511" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.15192 6.37511C9.00567 4.90117 7.76211 3.75 6.24967 3.75C4.63884 3.75 3.33301 5.05583 3.33301 6.66667C3.33301 8.2775 4.63884 9.58333 6.24967 9.58333C6.54452 9.58333 6.82913 9.53958 7.0974 9.45825" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.3333 13.7502C18.3333 11.449 16.2813 9.5835 13.75 9.5835" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14.5837 16.2502C14.5837 13.949 12.5317 12.0835 10.0003 12.0835C7.46902 12.0835 5.41699 13.949 5.41699 16.2502" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.25033 9.5835C3.71902 9.5835 1.66699 11.449 1.66699 13.7502" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[15px] font-bold text-white">Show member list</span>
              </div>
              <button
                onClick={() => setShowMemberList(!showMemberList)}
                className={`relative w-[38px] h-5 rounded-full p-0.5 transition-colors ${
                  showMemberList ? 'bg-gradient-to-l from-purple to-darkPurple' : 'bg-[#523A83]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${showMemberList ? 'translate-x-[18px]' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Allow emoji & reactions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.2192 3.32846C13.9844 1.95769 12.034 2.51009 10.8623 3.39001C10.3818 3.7508 10.1417 3.93119 10.0003 3.93119C9.85899 3.93119 9.61882 3.7508 9.13832 3.39001C7.96667 2.51009 6.01623 1.95769 3.78152 3.32846C0.848716 5.12745 0.185092 11.0624 6.94993 16.0695C8.23842 17.0232 8.88266 17.5 10.0003 17.5C11.118 17.5 11.7622 17.0232 13.0507 16.0695C19.8156 11.0624 19.1519 5.12745 16.2192 3.32846Z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="text-[15px] font-bold text-white">Allow emoji & reactions</span>
              </div>
              <button
                onClick={() => setAllowEmoji(!allowEmoji)}
                className={`relative w-[38px] h-5 rounded-full p-0.5 transition-colors ${
                  allowEmoji ? 'bg-gradient-to-l from-purple to-darkPurple' : 'bg-[#523A83]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${allowEmoji ? 'translate-x-[18px]' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* View count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.5137 16.6665H15.9222C16.8804 16.6665 17.6426 16.2299 18.3269 15.6195C20.0653 14.0687 15.9787 12.4998 14.5837 12.4998M12.917 4.22381C13.1062 4.18628 13.3027 4.1665 13.5043 4.1665C15.0209 4.1665 16.2503 5.2858 16.2503 6.6665C16.2503 8.04721 15.0209 9.1665 13.5043 9.1665C13.3027 9.1665 13.1062 9.14675 12.917 9.10917" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M3.73443 13.426C2.75195 13.9525 0.175949 15.0276 1.7449 16.3728C2.51133 17.03 3.36493 17.5 4.4381 17.5H10.5619C11.6351 17.5 12.4887 17.03 13.2551 16.3728C14.8241 15.0276 12.2481 13.9525 11.2656 13.426C8.96167 12.1913 6.03833 12.1913 3.73443 13.426Z" stroke="white" strokeWidth="1.5"/>
                  <path d="M10.8337 6.24984C10.8337 8.09079 9.34124 9.58317 7.50033 9.58317C5.65938 9.58317 4.16699 8.09079 4.16699 6.24984C4.16699 4.40889 5.65938 2.9165 7.50033 2.9165C9.34124 2.9165 10.8337 4.40889 10.8337 6.24984Z" stroke="white" strokeWidth="1.5"/>
                </svg>
                <span className="text-[15px] font-bold text-white">View count</span>
              </div>
              <button
                onClick={() => setViewCount(!viewCount)}
                className={`relative w-[38px] h-5 rounded-full p-0.5 transition-colors ${
                  viewCount ? 'bg-gradient-to-l from-purple to-darkPurple' : 'bg-[#523A83]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${viewCount ? 'translate-x-[18px]' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Restrict voters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.0833 6.66667C12.0833 4.36548 10.2178 2.5 7.91667 2.5C5.61548 2.5 3.75 4.36548 3.75 6.66667C3.75 8.96783 5.61548 10.8333 7.91667 10.8333C10.2178 10.8333 12.0833 8.96783 12.0833 6.66667Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2.08301 16.6668C2.08301 13.4452 4.69468 10.8335 7.91634 10.8335C8.81101 10.8335 9.65859 11.0349 10.4163 11.3948" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12.958 12.5415L17.0413 16.6248M17.9163 14.5832C17.9163 12.9723 16.6105 11.6665 14.9997 11.6665C13.3888 11.6665 12.083 12.9723 12.083 14.5832C12.083 16.194 13.3888 17.4998 14.9997 17.4998C16.6105 17.4998 17.9163 16.194 17.9163 14.5832Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[15px] font-bold text-white">Restrict voters</span>
              </div>
              <button
                onClick={() => setRestrictVoters(!restrictVoters)}
                className={`relative w-[38px] h-5 rounded-full p-0.5 transition-colors ${
                  restrictVoters ? 'bg-gradient-to-l from-purple to-darkPurple' : 'bg-[#523A83]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${restrictVoters ? 'translate-x-[18px]' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Access Type */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-xs font-bold text-white">Access Type</span>
            <button className="flex items-center justify-between px-4 py-2.5 rounded-lg border border-[#181B22] custom-bg-blur">
              <span className="text-[15px] font-bold text-white">Public</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
                <path fillRule="evenodd" clipRule="evenodd" d="M3.71209 6.52459C4.0782 6.15847 4.6718 6.15847 5.03791 6.52459L10 11.4867L14.9621 6.52459C15.3282 6.15847 15.9218 6.15847 16.2879 6.52459C16.654 6.8907 16.654 7.4843 16.2879 7.85041L10.6629 13.4754C10.2968 13.8415 9.7032 13.8415 9.33709 13.4754L3.71209 7.85041C3.34597 7.4843 3.34597 6.8907 3.71209 6.52459Z" fill="white"/>
              </svg>
            </button>
          </div>

          {/* Monetization */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-xs font-bold text-white">Monetization</span>
            <div className="flex gap-4">
              <button className="flex items-center justify-between px-4 py-2.5 flex-1 rounded-lg border border-[#181B22] custom-bg-blur">
                <span className="text-[15px] font-bold text-white">Free</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.71209 6.52459C4.0782 6.15847 4.6718 6.15847 5.03791 6.52459L10 11.4867L14.9621 6.52459C15.3282 6.15847 15.9218 6.15847 16.2879 6.52459C16.654 6.8907 16.654 7.4843 16.2879 7.85041L10.6629 13.4754C10.2968 13.8415 9.7032 13.8415 9.33709 13.4754L3.71209 7.85041C3.34597 7.4843 3.34597 6.8907 3.71209 6.52459Z" fill="white"/>
                </svg>
              </button>
              <button className="flex items-center justify-between px-4 py-2.5 flex-1 rounded-lg border border-[#181B22] custom-bg-blur">
                <span className="text-[15px] font-bold text-[#B0B0B0]">Ammount</span>
                <span className="text-[15px] font-bold text-[#B0B0B0]">$</span>
              </button>
            </div>
          </div>

          {/* Visibility */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-xs font-bold text-white">Visibility</span>
            <div className="flex gap-2.5">
              <button
                onClick={() => setVisibility('visible')}
                className={`flex items-center justify-center h-[26px] px-4 py-2.5 flex-1 rounded-lg ${
                  visibility === 'visible' 
                    ? 'bg-gradient-to-l from-purple to-darkPurple' 
                    : 'border border-[#181B22] custom-bg-blur'
                }`}
              >
                <span className={`text-[15px] font-bold ${visibility === 'visible' ? 'text-white' : 'text-[#B0B0B0]'}`}>
                  Visible in search
                </span>
              </button>
              <button
                onClick={() => setVisibility('hidden')}
                className={`flex items-center justify-center h-[26px] px-4 py-2.5 flex-1 rounded-lg ${
                  visibility === 'hidden' 
                    ? 'bg-gradient-to-l from-purple to-darkPurple' 
                    : 'border border-[#181B22] custom-bg-blur'
                }`}
              >
                <span className={`text-[15px] font-bold ${visibility === 'hidden' ? 'text-white' : 'text-[#B0B0B0]'}`}>
                  Hidden
                </span>
              </button>
            </div>
          </div>

          {/* Save Changes */}
          <button className="flex items-center justify-center h-[26px] px-4 py-2.5 w-full rounded-lg border border-[#181B22]">
            <span className="text-[15px] font-bold text-[#B0B0B0]">Save Changes</span>
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={onClose}
          className="flex items-center justify-center w-11 h-11 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChannelSettingsModal;
