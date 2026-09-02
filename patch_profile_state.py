import re

with open("src/pages/ProfilePage.tsx", "r") as f:
    content = f.read()

state_addition = """
  const [dailyCommitments, setDailyCommitments] = useState<string>(
    userIdentity?.dailyCommitments || ''
  );
  const [isEditingCommitments, setIsEditingCommitments] = useState<boolean>(!userIdentity?.dailyCommitments);

  const handleSaveCommitments = () => {
    if (userIdentity) {
      const updatedIdentity = {
        ...userIdentity,
        dailyCommitments
      };
      // saveUserIdentity is imported from utils/userProfile, let's just make sure it's available.
      // Wait, is saveUserIdentity imported in this file?
      onSaveIdentity(updatedIdentity);
      setIsEditingCommitments(false);
      toast('تم حفظ الالتزامات اليومية بنجاح 🕒', 'success');
    }
  };
"""

content = content.replace(
    "const [targetExamDate, setTargetExamDate] = useState<string>(",
    state_addition + "\n  const [targetExamDate, setTargetExamDate] = useState<string>("
)

with open("src/pages/ProfilePage.tsx", "w") as f:
    f.write(content)

print("Patched states in ProfilePage.tsx")
