import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentSuccessPage() {
  return <div className="mx-auto max-w-xl"><Card><CardHeader><CardTitle>Payment successful</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Your appointment payment has been received. You can review the appointment and invoice status from your appointments list.</p><Button render={<Link href="/dashboard/my-appointments" />}>View my appointments</Button></CardContent></Card></div>;
}
