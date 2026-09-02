import re

with open("src/pages/ProfilePage.tsx", "r") as f:
    content = f.read()

ui_addition = """
        {/* Section 3: Daily Commitments */}
        <div className="card-surface p-5 sm:p-7 rounded-3xl border border-[#E5E5E5] space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-4">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2A2A2A] font-heading">
                3. مواعيدك الثابتة والروتين اليومي
              </h3>
              <p className="text-xs text-[#6B6B6B]">
                أوقات النوم، الوجبات، الدروس، أو أي التزامات يومية عشان الجدول يبعد عنها
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {isEditingCommitments ? (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#2A2A2A]">
                    اكتب مواعيدك الثابتة (أوقات النوم، الدروس، الجيم، الوجبات، إلخ):
                  </label>
                  <textarea
                    value={dailyCommitments}
                    onChange={(e) => setDailyCommitments(e.target.value)}
                    placeholder="مثال:&#10;أنام من ١٢ بالليل وأصحى ٧ الصبح.&#10;فطار الساعة ٨، غداء الساعة ٣، عشاء الساعة ٩.&#10;عندي درس من ٤ لـ ٦ يومين في الأسبوع."
                    className="input-primary min-h-[120px] resize-y text-sm leading-relaxed w-full"
                    dir="rtl"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveCommitments}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  حفظ المواعيد
                </button>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl border border-[#E8F2E9] bg-gradient-to-br from-white to-[#FAFDFB] relative group">
                <button
                  type="button"
                  onClick={() => setIsEditingCommitments(true)}
                  className="absolute top-4 left-4 p-2 rounded-xl text-[#6B6B6B] hover:text-[#426B4B] hover:bg-[#E8F2E9] transition-all cursor-pointer bg-white border border-[#E5E5E5] shadow-sm z-10"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[#7A5B64] block mb-2">مواعيدك الثابتة المحفوظة:</span>
                  {dailyCommitments ? (
                    <p className="text-sm font-bold text-[#2A2A2A] whitespace-pre-wrap leading-relaxed">{dailyCommitments}</p>
                  ) : (
                    <p className="text-sm text-[#6B6B6B]">لم يتم تحديد مواعيد ثابتة.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

"""

content = content.replace(
    """<div className="card-surface p-5 sm:p-7 rounded-3xl border border-[#E5E5E5] space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold">""",
    ui_addition + """<div className="card-surface p-5 sm:p-7 rounded-3xl border border-[#E5E5E5] space-y-6">
          <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold">"""
)

content = content.replace("3. التفضيلات الشخصية وإعدادات التطبيق", "4. التفضيلات الشخصية وإعدادات التطبيق")

with open("src/pages/ProfilePage.tsx", "w") as f:
    f.write(content)

print("Patched UI in ProfilePage.tsx")
