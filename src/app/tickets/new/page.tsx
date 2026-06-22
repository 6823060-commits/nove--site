import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TicketForm from "@/components/TicketForm";

export default async function NewTicketPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/tickets/new");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-paper">
          Шинэ хүсэлт илгээх
        </h1>
        <p className="mt-1 text-sm text-mist">
          Алдаа мэдэгдэх, санал хүргэх, зохиолч болох хүсэлт гаргах — бүгдийг энд бичнэ үү.
          Admin таны хүсэлтийг хянаж хариу өгөх болно.
        </p>
      </div>
      <TicketForm />
    </div>
  );
}
