
import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrashIcon, PlusCircle } from 'lucide-react';

const AdminManagement = () => {
  const { admins, assignAdmin, isOwner } = useAdmin();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleAddAdmin = () => {
    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      toast({
        title: t("owner.admin.invalid_email", "Invalid Email"),
        description: t("owner.admin.provide_valid_email", "Please provide a valid email address."),
        variant: "destructive"
      });
      return;
    }

    assignAdmin(newAdminEmail);
    toast({
      title: t("owner.admin.admin_added", "Admin Added"),
      description: t("owner.admin.admin_access_granted", `Admin access granted to ${newAdminEmail}`),
    });
    setNewAdminEmail('');
  };

  if (!isOwner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("owner.admin.admin_management", "Admin Management")}</CardTitle>
          <CardDescription>
            {t("owner.admin.owner_only", "This feature is only available to the owner.")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("owner.admin.admin_management", "Admin Management")}</CardTitle>
        <CardDescription>
          {t("owner.admin.assign_admins", "Assign admin privileges to users by email.")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            placeholder={t("owner.admin.enter_email", "Enter email address")}
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
          />
          <Button onClick={handleAddAdmin} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {t("owner.admin.add", "Add")}
          </Button>
        </div>
        
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("owner.admin.email", "Email")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("owner.admin.actions", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-center text-sm text-gray-500">
                    {t("owner.admin.no_admins", "No admins assigned yet")}
                  </td>
                </tr>
              ) : (
                admins.map((email, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button variant="ghost" size="icon" className="text-red-500">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminManagement;
