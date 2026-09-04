import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentPage() {
  return <div className="mx-auto max-w-xl"><Card><CardHeader><CardTitle>Payment cancelled</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Your appointment is still saved. You can return to your appointments and complete payment later.</p><Button render={<Link href="/dashboard/my-appointments" />}>Return to my appointments</Button></CardContent></Card></div>;
}
