import React from 'react';

export default function Footer({ showCTA = true }) {
  return (
    <footer className="mt-auto">
      {/* Blue call to action section */}
      {showCTA && (
        <div className="bg-[#0b2463] text-white py-6 text-center flex flex-col sm:flex-row justify-center items-center gap-4">
          <span className="text-lg font-medium">คุณกำลังหางานอยู่ใช่ไหม ?</span>
          <button className="bg-white text-gray-800 font-bold px-6 py-2 rounded-full hover:bg-gray-100 transition-colors">
            เริ่มหางานได้เลย
          </button>
        </div>
      )}
      {/* Bottom Footer */}
      <div className="bg-[#e4e9f2] py-8">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo */}
          <div className="bg-[#8ba6d1] text-white font-bold text-3xl px-6 py-2 rounded-xl border-[4px] border-[#b4c9e8] opacity-80">
            <span>หางาน</span>
            <span className="text-[#b4c9e8]">.com</span>
          </div>

          {/* Contact Us */}
          <div className="flex items-center gap-4">
            <span className="font-medium text-gray-700">ติดต่อเรา</span>
            <div className="flex gap-2">
              {/* Mocking the icons with divs for now as exact colored SVGs are complex, we'll use simple colored circles */}
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-80">f</div>
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-80">L</div>
              <div className="w-8 h-8 bg-white border border-gray-300 rounded-lg flex items-center justify-center text-red-500 font-bold cursor-pointer hover:bg-gray-50">G</div>
            </div>
          </div>

          {/* Company Info */}
          <div className="text-xs text-gray-600 text-right">
            <p className="font-bold text-sm mb-1 text-gray-800">บริษัท หางาน ดอท คอม จำกัด</p>
            <p>มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตกำแพงแสน</p>
            <p>อาคาร SC11 (IT) คณะศิลปศาสตร์และวิทยาศาสตร์</p>
            <p>เลขที่ 1 หมู่ 6 ต.กำแพงแสน อ.กำแพงแสน จ.นครปฐม 73140</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
