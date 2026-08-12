import React from 'react';
import { MapPin, Truck, RefreshCw } from 'lucide-react';
import { getMarket, getDeliveryRange } from '@/lib/markets';

interface ShippingInfoProps {
  className?: string;
  targetMarket?: string | null;
}

const ShippingInfo: React.FC<ShippingInfoProps> = ({ className = '', targetMarket }) => {
  const market = getMarket(targetMarket);
  const deliveryRange = getDeliveryRange(market);

  return (
    <div className={`overflow-hidden rounded-[24px] border border-[#dce7de] bg-white ${className}`}>
      <div className="grid grid-cols-1 divide-y divide-[#e5ede6] md:grid-cols-3 md:divide-x md:divide-y-0">
        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#edf3ee] text-[#2e6b3e]">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#78867d]">Ships from</p>
              <p className="mt-1 text-sm font-semibold text-[#262626]">
                {market.shipsFrom} {market.shipsFromFlag}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#edf3ee] text-[#2e6b3e]">
              <Truck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#78867d]">Estimated delivery</p>
              <p className="mt-1 text-sm font-semibold text-[#262626]">Get it by {deliveryRange}</p>
              <p className="mt-1 text-sm text-[#5d6b62]">{market.freeShippingText}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#edf3ee] text-[#2e6b3e]">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#78867d]">Returns</p>
              <p className="mt-1 text-sm font-semibold text-[#262626]">{market.returnsText}</p>
              <p className="mt-1 text-sm text-[#5d6b62]">Hassle-free returns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
