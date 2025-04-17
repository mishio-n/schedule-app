export const ResetStorageButton: React.FC = () => {
  const handleReset = () => {
    if (confirm("本当にリセットしますか？")) {
      localStorage.removeItem("schedule-app-storage");
      alert("リセットしました。");
      // ページをリロードして、リセットされた状態を反映
      window.location.reload();
    }
  };

  return (
    <button
      type="button"
      className="bg-red-400 text-white px-4 py-2 rounded"
      onClick={handleReset}
    >
      リセット
    </button>
  );
};
