import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../components/LanguageContext';

export default function Pricing() {
  const { t, language } = useLanguage();

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-16">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-[#0b2463] mb-4">{t('pricingHeaderTitle')}</h1>
        <p className="text-gray-600">
          {t('pricingHeaderDesc')}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 max-w-5xl mx-auto">
        
        {/* Basic Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#0b2463] mb-2">{t('basicPlanTitle')}</h2>
            <p className="text-xs text-gray-500 min-h-[32px]">{t('basicPlanDesc')}</p>
          </div>
          <div className="mb-8 flex items-baseline">
            <span className="text-4xl font-bold text-[#0b2463]">{language === 'th' ? '฿3,200' : '$99'}</span>
            <span className="text-sm font-medium text-gray-500 ml-1">{t('basicPriceUnit')}</span>
          </div>
          <div className="space-y-4 mb-8 flex-1">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#4a6b9c] mt-0.5" />
              <span className="text-sm text-gray-700">{t('daysListing30')}</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#4a6b9c] mt-0.5" />
              <span className="text-sm text-gray-700">{t('standardSearchPlacement')}</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#4a6b9c] mt-0.5" />
              <span className="text-sm text-gray-700">{t('applicantTrackingIntegration')}</span>
            </div>
          </div>
          <button className="w-full py-2.5 bg-white text-[#4a6b9c] border border-[#4a6b9c] font-medium rounded-md hover:bg-gray-50 transition-colors">
            {t('selectPlanBtn')}
          </button>
        </div>

        {/* Pro Plan (Recommended) */}
        <div className="bg-white rounded-xl shadow-lg border-[2px] border-[#4a6b9c] p-8 flex flex-col relative transform md:-translate-y-4">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#4a6b9c] text-white text-[10px] font-bold uppercase tracking-wider py-1 px-4 rounded-full">
            {t('recommendedBadge')}
          </div>
          <div className="mb-6 mt-2">
            <h2 className="text-xl font-bold text-[#0b2463] mb-2">{t('proPlanTitle')}</h2>
            <p className="text-xs text-gray-500 min-h-[32px]">{t('proPlanDesc')}</p>
          </div>
          <div className="mb-8 flex items-baseline">
            <span className="text-4xl font-bold text-[#0b2463]">{language === 'th' ? '฿8,200' : '$249'}</span>
            <span className="text-sm font-medium text-gray-500 ml-1">{t('proPriceUnit')}</span>
          </div>
          <div className="space-y-4 mb-8 flex-1">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#4a6b9c] mt-0.5" />
              <span className="text-sm font-medium text-gray-900">{t('daysListing60')}</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#4a6b9c] mt-0.5" />
              <span className="text-sm font-medium text-gray-900">{t('featuredTagPlacement')}</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#4a6b9c] mt-0.5" />
              <span className="text-sm font-medium text-gray-900">{t('emailMatchingCandidates')}</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#4a6b9c] mt-0.5" />
              <span className="text-sm font-medium text-gray-900">{t('socialMediaPromotion')}</span>
            </div>
          </div>
          <button className="w-full py-2.5 bg-[#4a6b9c] text-white font-medium rounded-md hover:bg-[#3a5885] transition-colors">
            {t('selectPlanBtn')}
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#0b2463] mb-2">{t('enterprisePlanTitle')}</h2>
            <p className="text-xs text-gray-500 min-h-[32px]">{t('enterprisePlanDesc')}</p>
          </div>
          <div className="mb-8 flex items-baseline">
            <span className="text-4xl font-bold text-[#0b2463]">{t('enterprisePrice')}</span>
          </div>
          <div className="space-y-4 mb-8 flex-1">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#4a6b9c] mt-0.5" />
              <span className="text-sm text-gray-700">{t('unlimitedDurationOptions')}</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#4a6b9c] mt-0.5" />
              <span className="text-sm text-gray-700">{t('dedicatedAccountManager')}</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#4a6b9c] mt-0.5" />
              <span className="text-sm text-gray-700">{t('customBrandingProfile')}</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-[#4a6b9c] mt-0.5" />
              <span className="text-sm text-gray-700">{t('advancedApiAccess')}</span>
            </div>
          </div>
          <button className="w-full py-2.5 bg-white text-[#4a6b9c] border border-[#4a6b9c] font-medium rounded-md hover:bg-gray-50 transition-colors">
            {t('contactSalesBtn')}
          </button>
        </div>

      </div>

      {/* Trusted By */}
      <div className="text-center">
        <p className="text-xs font-medium text-gray-400 mb-6 uppercase tracking-wider">{t('trustedByLeaders')}</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-50 grayscale font-bold text-xl text-gray-600">
          <span>AcmeCorp</span>
          <span>GlobalTech</span>
          <span>Innovate Inc.</span>
          <span>Nexus Solutions</span>
        </div>
      </div>

    </div>
  );
}
