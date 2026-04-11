"use client";

import { CreateCustomerPaymentDialog } from "@/components/payments/CreateCustomerPaymentDialog";
import { CreateSellerPaymentDialog } from "@/components/payments/CreateSellerPaymentDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NewPaymentPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Record New Payment</h1>
        <p className="text-muted-foreground">
          Record a new payment from a customer or a payout to a seller.
        </p>
      </div>

      <Tabs defaultValue="customer" className="w-full max-w-2xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customer">Customer Payment</TabsTrigger>
          <TabsTrigger value="seller">Seller Payout</TabsTrigger>
        </TabsList>
        <TabsContent value="customer">
          <Card>
            <CardHeader>
              <CardTitle>Customer Payment</CardTitle>
              <CardDescription>
                Record customer payment by lump sum or by single bill.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-8">
                {/*
                  Ideally we should extract the form from the dialog to use it here directly.
                  For now, we'll provide the button to open the dialog as a quick integration.
                  Refactoring the form to be standalone is the next step.
                */}
                <CreateCustomerPaymentDialog />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seller">
          <Card>
            <CardHeader>
              <CardTitle>Seller Payout</CardTitle>
              <CardDescription>
                Record a payout to a seller against a chalan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-8">
                <CreateSellerPaymentDialog />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
