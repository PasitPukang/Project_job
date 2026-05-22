import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CompanyCard, PremiumCompanyCard, JobCategoryCard } from '../components/ui/Cards';
import { useLanguage } from '../components/LanguageContext';

export default function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const popularSearches = [
    { label: language === 'th' ? "งานแบบ Hybrid" : "Hybrid Work", param: "workType=Hybrid" },
    { label: language === 'th' ? "วิทยาศาสตร์" : "Science", param: "q=วิทยาศาสตร์" },
    { label: "UX/UI", param: "q=UX%2FUI" },
    { label: language === 'th' ? "ภาษาจีน" : "Chinese Language", param: "q=ภาษาจีน" },
    { label: language === 'th' ? "เงินเดือน 100K+" : "Salary 100k+", param: "salary=100000" },
    { label: language === 'th' ? "หยุดเสาร์-อาทิตย์" : "Weekend Off", param: "q=หยุดเสาร์-อาทิตย์" },
    { label: language === 'th' ? "ล่าม/แปล" : "Translator", param: "q=ล่าม" },
    { label: "AI Jobs", param: "q=AI" },
    { label: language === 'th' ? "จบใหม่" : "Fresh Graduate", param: "q=จบใหม่" },
    { label: "Cyber Security", param: "q=Cyber%20Security" },
    { label: "IT", param: "category=IT" },
    { label: language === 'th' ? "สถาปนิก" : "Architect", param: "q=สถาปนิก" },
    { label: language === 'th' ? "งานโรงแรม" : "Hotel Jobs", param: "q=โรงแรม" },
    { label: language === 'th' ? "รับสมัครงานด่วน" : "Urgent Hiring", param: "q=ด่วน" },
    { label: language === 'th' ? "เงินเดือน 50K+" : "Salary 50k+", param: "salary=50000" }
  ];

  const companiesOfTheYear = [
    { name: "บริษัท พีทีจี เอ็นเนอยี จำกัด (มหาชน)", image: "https://images.unsplash.com/photo-1542361345-89e58247f2d5?w=500&h=300&fit=crop" },
    { name: "บริษัท เซ็นทรัล รีเทล คอร์ปอเรชั่น จำกัด", image: "https://images.unsplash.com/photo-1519567281799-97127e7d667c?w=500&h=300&fit=crop" },
    { name: "บริษัท ซีพี ออลล์ จำกัด (มหาชน)", image: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=500&h=300&fit=crop" },
    { name: "บริษัท แอดวานซ์ อินโฟร์ เซอร์วิส", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&h=300&fit=crop" },
    { name: "บริษัท ปตท. จำกัด (มหาชน)", image: "https://images.unsplash.com/photo-1531968393081-3069151528cb?w=500&h=300&fit=crop" },
    { name: "บริษัท แพลน บี มีเดีย", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&h=300&fit=crop" }
  ];

  const premiumCompanies = [
    { name: "Uniqlo", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UNIQLO_logo.svg/512px-UNIQLO_logo.svg.png" },
    { name: "Daikin", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Daikin_logo.svg/512px-Daikin_logo.svg.png" },
    { name: "Krungsri Consumer", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Bank_of_Ayudhya_logo.svg/512px-Bank_of_Ayudhya_logo.svg.png" },
    { name: "SF", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/SF_Cinema_logo.svg/512px-SF_Cinema_logo.svg.png" },
    { name: "Farmhouse", logo: null }
  ];

  const hotCareers = [
    { title: language === 'th' ? "ออกแบบ" : "Design", category: "Design", count: "9,562", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop" },
    { title: language === 'th' ? "ไอที / โปรแกรมมิ่ง" : "IT / Programming", category: "IT", count: "9,853", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=300&fit=crop" },
    { title: language === 'th' ? "การตลาด / มาร์เก็ตติ้ง" : "Marketing", category: "Marketing", count: "1,544", image: "https://images.unsplash.com/photo-1586528116311-ad8ed7c80a30?w=500&h=300&fit=crop" }
  ];

  const handleKeywordClick = (param) => {
    navigate(`/search?${param}`);
  };

  const handleCompanyClick = (companyName) => {
    navigate(`/search?q=${encodeURIComponent(companyName)}`);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-12">
      
      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-900 rounded-2xl p-8 md:p-12 text-white text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-opacity-20 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop')` }}></div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">{t('heroTitle')}</h1>
          <p className="text-lg text-blue-100 font-medium">{t('heroSubtitle')}</p>
          <div className="flex bg-white rounded-xl shadow-md p-1.5 max-w-lg mx-auto">
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              className="flex-1 px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  navigate(`/search?q=${encodeURIComponent(e.target.value)}`);
                }
              }}
            />
            <button 
              onClick={(e) => {
                const input = e.currentTarget.previousSibling;
                navigate(`/search?q=${encodeURIComponent(input.value)}`);
              }}
              className="bg-[#2B5292] hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors"
            >
              {t('searchBtn')}
            </button>
          </div>
        </div>
      </section>

      {/* POPULAR SEARCH */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-wider">{t('popularSearches')}</h2>
        <div className="flex flex-wrap gap-2.5">
          {popularSearches.map((item, index) => (
            <button 
              key={index}
              onClick={() => handleKeywordClick(item.param)}
              className="bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 text-xs font-semibold py-2 px-4 rounded-full border border-gray-200 transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* BANNER */}
      <section>
        <div className="w-full h-48 md:h-64 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl overflow-hidden flex items-center justify-center relative shadow-md">
          <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=300&fit=crop')` }}></div>
          <div className="z-10 text-center text-white px-4">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wider mb-2">We Are HIRING</h2>
            <p className="text-lg md:text-xl font-bold text-yellow-100">Find the best opportunities or post a job today</p>
          </div>
        </div>
      </section>

      {/* COMPANY OF THE YEAR */}
      <section>
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          {language === 'th' ? "บริษัทยอดเยี่ยมแห่งปี (Company of the Year)" : "Companies of the Year"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {companiesOfTheYear.map((company, index) => (
            <div key={index} onClick={() => handleCompanyClick(company.name)} className="cursor-pointer">
              <CompanyCard name={company.name} imageUrl={company.image} />
            </div>
          ))}
        </div>
      </section>

      {/* PREMIUM COMPANY */}
      <section>
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          {language === 'th' ? "หางานบริษัทชั้นนำ (Premium Company)" : "Jobs at Top Companies"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {premiumCompanies.map((company, index) => (
            <div key={index} onClick={() => handleCompanyClick(company.name)} className="cursor-pointer">
              <PremiumCompanyCard name={company.name} logoUrl={company.logo} />
            </div>
          ))}
        </div>
      </section>

      {/* HOT CAREERS */}
      <section>
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          {language === 'th' ? "งานตามสาขาอาชีพ (Hot Careers)" : "Hot Careers"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hotCareers.map((career, index) => (
            <div key={index} onClick={() => handleKeywordClick(`category=${career.category}`)} className="cursor-pointer">
              <JobCategoryCard 
                title={career.title} 
                count={career.count} 
                imageUrl={career.image} 
              />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
