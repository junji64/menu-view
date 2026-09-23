import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Cpu,
  Sparkles,
  Zap,
  Layers,
  Smartphone,
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import {
  getAdminProvider,
  setAdminProvider,
  getAdminApiKey,
  setAdminApiKey,
  getAdminPreferredModel,
  setAdminPreferredModel,
  verifyAdminApiKey,
  getMobileSyncUrl,
} from '../services/api';
import { LLMProvider, LLMModelOption } from '../types';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated?: (hasCustomKey: boolean) => void;
}

const GEMINI_MODELS: LLMModelOption[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    description: '서버 혼잡(503) 없이 가장 안정적이고 뛰어난 다국어 메뉴판 시각 분석을 제공합니다.',
    badge: '추천/안정적',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    provider: 'gemini',
    description: '초경량 초고속 모델로 매우 빠른 응답 속도를 제공합니다.',
    badge: '초고속',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'gemini',
    description: '최신 플래시 모델로 심층 추론 및 다국어 메뉴판 시각 분석 능력이 탁월합니다.',
    badge: '최신',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    provider: 'gemini',
    description: '항상 최신 버전의 Flash 모델을 자동으로 적용합니다.',
    badge: '기본',
  },
];

const OPENAI_MODELS: LLMModelOption[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o (Omni)',
    provider: 'openai',
    description: '멀티모달 시각 분석과 고난도 다국어 번역 능력이 가장 뛰어난 플래그십 모델입니다.',
    badge: '추천',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: '빠른 처리 속도와 높은 경제성을 갖춘 고효율 멀티모달 비전 모델입니다.',
    badge: '가성비',
  },
  {
    id: 'o1',
    name: 'OpenAI o1',
    provider: 'openai',
    description: '복잡한 손글씨 및 까다로운 현지 음식 맥락을 스스로 사고하여 추론하는 모델입니다.',
    badge: '심층추론',
  },
  {
    id: 'o3-mini',
    name: 'OpenAI o3-mini',
    provider: 'openai',
    description: '고성능 추론 능력과 빠른 속도를 균형 있게 제공하는 최신 추론 모델입니다.',
    badge: '최신',
  },
  {
    id: 'chatgpt-4o-latest',
    name: 'ChatGPT-4o Latest',
    provider: 'openai',
    description: 'ChatGPT 서비스에서 지속적으로 업데이트되는 최신 동적 GPT-4o 릴리즈 버전입니다.',
    badge: '업데이트',
  },
];

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('gemini');
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [openaiKeyInput, setOpenaiKeyInput] = useState('');
  const [selectedGeminiModel, setSelectedGeminiModel] = useState('gemini-3.6-flash');
  const [selectedOpenaiModel, setSelectedOpenaiModel] = useState('gpt-4o');

  const [showKey, setShowKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showMobileQr, setShowMobileQr] = useState(false);
  const [copiedSyncLink, setCopiedSyncLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const activeProvider = getAdminProvider();
      setSelectedProvider(activeProvider);
      setGeminiKeyInput(getAdminApiKey('gemini'));
      setOpenaiKeyInput(getAdminApiKey('openai'));
      setSelectedGeminiModel(getAdminPreferredModel('gemini'));
      setSelectedOpenaiModel(getAdminPreferredModel('openai'));
      setVerifyResult(null);
      setSavedSuccess(false);
      setShowMobileQr(false);
      setCopiedSyncLink(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentKeyInput = selectedProvider === 'openai' ? openaiKeyInput : geminiKeyInput;
  const currentModel = selectedProvider === 'openai' ? selectedOpenaiModel : selectedGeminiModel;
  const currentModelList = selectedProvider === 'openai' ? OPENAI_MODELS : GEMINI_MODELS;

  const handleKeyChange = (val: string) => {
    if (selectedProvider === 'openai') {
      setOpenaiKeyInput(val);
    } else {
      setGeminiKeyInput(val);
    }
    setVerifyResult(null);
  };

  const handleModelChange = (modelId: string) => {
    if (selectedProvider === 'openai') {
      setSelectedOpenaiModel(modelId);
    } else {
      setSelectedGeminiModel(modelId);
    }
    setVerifyResult(null);
  };

  const handleVerify = async () => {
    const keyToTest = currentKeyInput.trim();
    if (!keyToTest) {
      setVerifyResult({
        success: false,
        message: `${selectedProvider === 'openai' ? 'OpenAI' : 'Gemini'} API Key를 입력해 주세요.`,
      });
      return;
    }

    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await verifyAdminApiKey(keyToTest, currentModel, selectedProvider);
      setVerifyResult({
        success: true,
        message: res.message || `${selectedProvider === 'openai' ? 'OpenAI' : 'Gemini'} API Key 검증에 성공했습니다!`,
      });
    } catch (err: any) {
      setVerifyResult({
        success: false,
        message: err.message || 'API Key 인증에 실패했습니다.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = () => {
    setAdminProvider(selectedProvider);
    setAdminApiKey(geminiKeyInput.trim(), 'gemini');
    setAdminApiKey(openaiKeyInput.trim(), 'openai');
    setAdminPreferredModel(selectedGeminiModel, 'gemini');
    setAdminPreferredModel(selectedOpenaiModel, 'openai');

    setSavedSuccess(true);
    if (onKeyUpdated) {
      const activeKey = selectedProvider === 'openai' ? openaiKeyInput.trim() : geminiKeyInput.trim();
      onKeyUpdated(Boolean(activeKey));
    }
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClearCurrentKey = () => {
    if (selectedProvider === 'openai') {
      setOpenaiKeyInput('');
      setAdminApiKey('', 'openai');
    } else {
      setGeminiKeyInput('');
      setAdminApiKey('', 'gemini');
    }
    setVerifyResult(null);
    if (onKeyUpdated) {
      onKeyUpdated(false);
    }
  };

  const hasCurrentCustomKey = Boolean(currentKeyInput.trim());

  return (
    <div
      id="admin-settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="admin-settings-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-stone-900 border border-stone-700 rounded-3xl shadow-2xl overflow-hidden text-stone-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                관리자 LLM 설정
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">
                  Gemini & OpenAI 지원
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                메뉴 분석 및 번역에 사용할 AI Provider와 모델, API 키를 설정합니다.
              </p>
            </div>
          </div>
          <button
            id="close-admin-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Provider Selector Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 block">
              AI 엔진(Provider) 선택
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-stone-950 rounded-2xl border border-stone-800">
              <button
                type="button"
                id="provider-tab-gemini"
                onClick={() => {
                  setSelectedProvider('gemini');
                  setVerifyResult(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
                  selectedProvider === 'gemini'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Google Gemini</span>
                {geminiKeyInput.trim() && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                )}
              </button>

              <button
                type="button"
                id="provider-tab-openai"
                onClick={() => {
                  setSelectedProvider('openai');
                  setVerifyResult(null);
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition ${
                  selectedProvider === 'openai'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>OpenAI</span>
                {openaiKeyInput.trim() && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                )}
              </button>
            </div>
          </div>

          {/* Status Indicator for selected provider */}
          <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 block mb-0.5">
                {selectedProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} 작동 상태
              </span>
              {hasCurrentCustomKey ? (
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>관리자 등록 API Key 사용 중</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium text-stone-300">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>
                    {selectedProvider === 'openai'
                      ? '등록된 키 없음 (OpenAI 사용 시 키 입력 필수)'
                      : '시스템 기본 서버 키 사용 중'}
                  </span>
                </div>
              )}
            </div>
            {hasCurrentCustomKey && (
              <button
                id="reset-admin-key-btn"
                type="button"
                onClick={handleClearCurrentKey}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-500/40 text-xs text-stone-400 border border-stone-700 transition flex items-center gap-1.5"
                title="등록된 키를 삭제합니다."
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>키 삭제</span>
              </button>
            )}
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-300 block">
                {selectedProvider === 'openai' ? 'OpenAI API Key' : 'Google Gemini API Key'}
              </label>
              <a
                href={
                  selectedProvider === 'openai'
                    ? 'https://platform.openai.com/api-keys'
                    : 'https://aistudio.google.com/app/apikey'
                }
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline inline-flex items-center gap-1 text-[11px]"
              >
                <span>{selectedProvider === 'openai' ? 'OpenAI 키 발급' : 'Gemini 무료 키 발급'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                id="admin-api-key-input"
                type={showKey ? 'text' : 'password'}
                value={currentKeyInput}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder={
                  selectedProvider === 'openai'
                    ? 'sk-proj-... 또는 sk-...'
                    : 'AIzaSy... (Gemini API Key)'
                }
                className={`w-full bg-stone-950 border rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 pr-20 font-mono transition ${
                  selectedProvider === 'gemini' &&
                  currentKeyInput.trim() &&
                  !currentKeyInput.trim().startsWith('AIzaSy')
                    ? 'border-amber-600/70 focus:border-amber-500'
                    : 'border-stone-700'
                }`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  id="toggle-key-visibility-btn"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition"
                  title={showKey ? '키 숨기기' : '키 보기'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Key format hint warning */}
            {selectedProvider === 'gemini' &&
              currentKeyInput.trim() &&
              !currentKeyInput.trim().startsWith('AIzaSy') && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-[11px] text-amber-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-200">
                      Google AI Studio API Key 형식이 아닐 수 있습니다.
                    </p>
                    <p className="text-stone-300 leading-relaxed">
                      Google Gemini API Key는 보통 <code className="bg-stone-900 px-1 py-0.5 rounded text-amber-300 font-mono">AIzaSy...</code>로 시작합니다.{' '}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-emerald-400 hover:text-emerald-300"
                      >
                        Google AI Studio
                      </a>
                      에서 무료로 새 키를 발급받으시거나, 아래 [키 삭제]를 눌러 <strong>시스템 기본 서버 키</strong>를 이용하실 수 있습니다.
                    </p>
                  </div>
                </div>
              )}

            <p className="text-[11px] text-stone-400">
              * 입력된 API 키는 브라우저 로컬 저장소에 암호화되어 보관되며, AI 요청 시에만 서버 헤더를 통해 안전하게 전달됩니다.
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-300 block">
                {selectedProvider === 'openai' ? 'OpenAI 모델 선택' : 'Gemini 모델 선택'}
              </label>
              <span className="text-[11px] text-stone-400">비전 멀티모달 지원</span>
            </div>

            <div className="space-y-2">
              {currentModelList.map((model) => (
                <label
                  key={model.id}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                    currentModel === model.id
                      ? 'bg-emerald-950/60 border-emerald-500/60 text-stone-100'
                      : 'bg-stone-950/40 border-stone-800 hover:border-stone-700 text-stone-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="adminModelSelect"
                    value={model.id}
                    checked={currentModel === model.id}
                    onChange={(e) => handleModelChange(e.target.value)}
                    className="mt-1 accent-emerald-500"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-100">{model.name}</span>
                      {model.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-[10px] text-emerald-300 font-semibold">
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-stone-400 mt-1 leading-relaxed">{model.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Test verification feedback */}
          {verifyResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                verifyResult.success
                  ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/70 border-rose-500/50 text-rose-200'
              }`}
            >
              {verifyResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <div className="font-medium leading-relaxed">{verifyResult.message}</div>
                {!verifyResult.success && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-800/40">
                    <a
                      href={
                        selectedProvider === 'openai'
                          ? 'https://platform.openai.com/api-keys'
                          : 'https://aistudio.google.com/app/apikey'
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-100 text-[11px] font-semibold border border-rose-500/50 flex items-center gap-1 transition"
                    >
                      <span>{selectedProvider === 'openai' ? 'OpenAI 키 발급받기' : 'Google AI Studio 키 발급받기'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {hasCurrentCustomKey && (
                      <button
                        type="button"
                        onClick={handleClearCurrentKey}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] border border-stone-600 transition"
                      >
                        기본 시스템 키 사용 (초기화)
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Sync Section */}
          {hasCurrentCustomKey && (
            <div className="p-4 rounded-2xl bg-stone-950/90 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-stone-200">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>스마트폰/모바일 기기로 설정 전달</span>
                </div>
                <button
                  type="button"
                  id="toggle-mobile-qr-btn"
                  onClick={() => setShowMobileQr(!showMobileQr)}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{showMobileQr ? 'QR 코드 닫기' : 'QR 코드 보기'}</span>
                </button>
              </div>

              <p className="text-[11px] text-stone-400 leading-relaxed">
                스마트폰에서 긴 API 키를 직접 입력할 필요 없이, 아래 링크를 복사하여 카카오톡/메모장 등으로 스마트폰에서 열거나 카메라로 QR 코드를 스캔하세요.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getMobileSyncUrl(selectedProvider)}
                  className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-[11px] text-stone-300 font-mono select-all truncate"
                />
                <button
                  type="button"
                  id="copy-mobile-sync-link-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(getMobileSyncUrl(selectedProvider));
                    setCopiedSyncLink(true);
                    setTimeout(() => setCopiedSyncLink(false), 3000);
                  }}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-semibold rounded-xl border border-stone-700 flex items-center gap-1.5 transition shrink-0"
                >
                  {copiedSyncLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>링크 복사</span>
                    </>
                  )}
                </button>
              </div>

              {showMobileQr && (
                <div className="pt-2 flex flex-col items-center justify-center p-4 bg-white rounded-2xl">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      getMobileSyncUrl(selectedProvider)
                    )}`}
                    alt="모바일 연동 QR 코드"
                    className="w-44 h-44 object-contain rounded-xl"
                  />
                  <p className="text-[11px] text-stone-800 font-semibold mt-2.5">
                    스마트폰 기본 카메라로 비추면 바로 열립니다
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Saved notification */}
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-center text-xs font-bold animate-pulse">
              ✅ {selectedProvider === 'openai' ? 'OpenAI' : 'Google Gemini'} 설정이 성공적으로 저장되었습니다!
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between gap-3">
          <button
            id="test-admin-key-btn"
            type="button"
            onClick={handleVerify}
            disabled={isVerifying || !currentKeyInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>연결 테스트 중...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedProvider === 'openai' ? 'OpenAI 키' : 'Gemini 키'} 테스트</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              id="cancel-admin-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 text-xs font-semibold transition"
            >
              닫기
            </button>
            <button
              id="save-admin-settings-btn"
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950"
            >
              저장 및 적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
