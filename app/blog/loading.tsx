import Nav from "@/components/Nav";
import Loader from "@/components/Loader";

export default function BlogLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      <Nav />
      <div className="flex-1 flex items-center justify-center py-12">
        <Loader size="lg" />
      </div>
    </div>
  );
}
