import React, { useState } from 'react';
import { OrderItem, RestaurantInfo } from '../types';
import { X, Trash2, Plus, Minus, Send, MessageSquare, Volume2, CheckCircle } from 'lucide-react';
import { speakText } from '../services/api';

interface OrderSheetModalProps {
  orders: OrderItem[];
  restaurant: RestaurantInfo;
  onClose: () => void;
  onUpdateQuantity: (dishId: string, quantity: number) => void;
  onRemoveItem: (dishId: string) => void;
  onClearAll: () => void;
}

export const OrderSheetModal: React.FC<OrderSheetModalProps> = ({
  orders,
  restaurant,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearAll,
}) => {
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  const orderList = Array.isArray(orders) ? orders : [];

  const totalKRW = orderList.reduce(
    (sum, item) => sum + (item.dish.priceKRW || 0) * (item.quantity || 1),
    0
  );

  const totalOriginalEstimated = orderList.reduce((sum, item) => {
    // Extract numerical value from priceOriginal
    const num = parseFloat((item.dish.priceOriginal || '').replace(/[^0-9.]/g, '')) || 0;
    return sum + num * (item.quantity || 1);
  }, 0);

  const handleSpeakAll = () => {
    const text = orderList
      .map((item) => `${item.dish.originalName || ''} ${item.quantity || 1}`)
      .join(', ');
    speakText(text, restaurant?.languageCode || 'en-US');
  };

  if (orderList.length === 0) {
    return (
      <div
        id="order-sheet-modal-overlay"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          id="order-sheet-empty-box"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-stone-100">주문표가 비어 있습니다</h3>
          <p className="text-sm text-stone-400">
            원하는 메뉴 카드의 [+ 주문 담기] 버튼을 눌러 이곳에 모아보세요.
          </p>
          <button
            id="close-empty-order-btn"
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition"
          >
            메뉴 둘러보기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="order-sheet-modal-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="order-sheet-modal-container"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-2xl bg-stone-900 border rounded-3xl overflow-hidden shadow-2xl transition-all ${
          isPresentationMode
            ? 'border-emerald-400 bg-black max-w-3xl'
            : 'border-stone-700 max-w-2xl'
        }`}
      >
        {/* Header */}
        <div className="p-5 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-100">
                {isPresentationMode ? '점원 제시용 주문서 (Order Sheet)' : '오늘의 선택 주문표'}
              </h3>
              <p className="text-xs text-stone-400">
                {restaurant.name} • {restaurant.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="toggle-presentation-mode-btn"
              onClick={() => setIsPresentationMode(!isPresentationMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                isPresentationMode
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                  : 'bg-stone-800 text-emerald-400 hover:bg-stone-700 border border-emerald-500/30'
              }`}
            >
              {isPresentationMode ? '일반 모드로 복귀' : '점원에게 보여주기 모드'}
            </button>
            <button
              id="close-order-sheet-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Presentation Notice when active */}
        {isPresentationMode && (
          <div className="bg-emerald-950/80 px-6 py-3 border-b border-emerald-500/40 text-center">
            <div className="text-sm font-semibold text-emerald-300">
              👉 이 화면을 식당 직원에게 그대로 보여주세요 (Show this screen to the waiter)
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {orders.map((item) => (
            <div
              key={item.dish.id}
              className={`p-4 rounded-2xl border transition-all ${
                isPresentationMode
                  ? 'bg-stone-900 border-emerald-500/50 p-5'
                  : 'bg-stone-800/80 border-stone-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Original Name in Big Bold for Waiter */}
                  <div
                    className={`font-bold text-stone-100 ${
                      isPresentationMode ? 'text-xl text-emerald-300' : 'text-base'
                    }`}
                  >
                    {item.dish.originalName}
                  </div>

                  {!isPresentationMode && (
                    <div className="text-xs text-stone-300 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
                        발음: [{item.dish.originalPronunciation}]
                      </span>
                      <span>{item.dish.koreanName}</span>
                      <span className="text-stone-500">•</span>
                      <span className="text-amber-300 font-semibold">{item.dish.priceOriginal}</span>
                      <span className="text-emerald-300 font-bold">
                        (한화 약 {(item.dish.priceKRW * item.quantity).toLocaleString()}원)
                      </span>
                    </div>
                  )}

                  {/* Special Custom Requests */}
                  {item.specialRequests && item.specialRequests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.specialRequests.map((req, rIdx) => (
                        <span
                          key={rIdx}
                          className="px-2.5 py-0.5 rounded-md bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-semibold"
                        >
                          ⚠️ {req}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quantity & Price */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-stone-950 px-2.5 py-1 rounded-xl border border-stone-800">
                    <button
                      id={`dec-order-qty-${item.dish.id}`}
                      onClick={() => onUpdateQuantity(item.dish.id, item.quantity - 1)}
                      className="p-1 text-stone-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span
                      className={`font-extrabold ${
                        isPresentationMode ? 'text-xl text-white' : 'text-sm text-stone-200'
                      }`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      id={`inc-order-qty-${item.dish.id}`}
                      onClick={() => onUpdateQuantity(item.dish.id, item.quantity + 1)}
                      className="p-1 text-stone-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!isPresentationMode && (
                    <button
                      id={`remove-order-item-${item.dish.id}`}
                      onClick={() => onRemoveItem(item.dish.id)}
                      className="p-2 text-stone-500 hover:text-rose-400 hover:bg-stone-700/50 rounded-lg transition"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Totals */}
        <div className="p-5 bg-stone-950 border-t border-stone-800 space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-sm font-semibold text-stone-300">총 예상 금액 (Estimated Total)</span>
              {restaurant.exchangeRateToKRW && (
                <div className="text-[11px] text-emerald-400 mt-0.5">
                  적용 환율: 1 {restaurant.currencyCode} ≈ {restaurant.exchangeRateToKRW.toLocaleString()}원
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-amber-400">
                {totalOriginalEstimated > 0
                  ? `${totalOriginalEstimated.toLocaleString()} ${restaurant.currencySymbol}`
                  : ''}
              </div>
              <div className="text-xs font-bold text-emerald-300">
                한화 약 {totalKRW.toLocaleString()}원
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="clear-all-orders-btn"
              onClick={onClearAll}
              className="px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition"
            >
              전체 비우기
            </button>

            <button
              id="speak-all-orders-btn"
              onClick={handleSpeakAll}
              className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>전체 주문 음성으로 읽기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
