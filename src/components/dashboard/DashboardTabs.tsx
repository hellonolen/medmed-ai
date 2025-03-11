
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface TabsProps {
  handleExportCSV: (dataType: string) => void;
  searchHistory: any[];
  userData: any[];
  sponsorData: any[];
}

const DashboardTabs = ({ handleExportCSV, searchHistory, userData, sponsorData }: TabsProps) => {
  const { t } = useLanguage();

  return (
    <Tabs defaultValue="analytics" className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="analytics">{t("owner.tabs.analytics", "Analytics")}</TabsTrigger>
        <TabsTrigger value="search_history">{t("owner.tabs.search_history", "Search History")}</TabsTrigger>
        <TabsTrigger value="users">{t("owner.tabs.users", "User Management")}</TabsTrigger>
        <TabsTrigger value="sponsors">{t("owner.tabs.sponsors", "Sponsor Management")}</TabsTrigger>
      </TabsList>

      {/* Analytics Tab Content */}
      <TabsContent value="analytics" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("owner.analytics.title", "Platform Analytics")}</CardTitle>
            <CardDescription>
              {t("owner.analytics.description", "Overview of platform usage and performance.")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Analytics content here */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Analytics Cards */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{t("owner.analytics.searches", "Total Searches")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{searchHistory.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{t("owner.analytics.users", "Registered Users")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{userData.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{t("owner.analytics.sponsors", "Active Sponsors")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{sponsorData.length}</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Search History Tab Content */}
      <TabsContent value="search_history" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("owner.search_history.title", "User Search History")}</CardTitle>
              <CardDescription>
                {t("owner.search_history.description", "View and export all search queries made on the platform.")}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => handleExportCSV('searchHistory')}
            >
              {t("owner.actions.export", "Export to CSV")}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("owner.search_history.user", "User")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("owner.search_history.query", "Search Query")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("owner.search_history.date", "Date")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchHistory.map((search, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {search.user || "Anonymous"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {search.query}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {search.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* User Management Tab Content */}
      <TabsContent value="users" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("owner.users.title", "User Management")}</CardTitle>
              <CardDescription>
                {t("owner.users.description", "Manage and export registered user data.")}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => handleExportCSV('userData')}
            >
              {t("owner.actions.export", "Export to CSV")}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("owner.users.name", "Name")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("owner.users.email", "Email")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("owner.users.phone", "Phone")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("owner.users.signup_date", "Signup Date")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userData.map((user, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.signupDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Sponsor Management Tab Content */}
      <TabsContent value="sponsors" className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("owner.sponsors.title", "Sponsor Management")}</CardTitle>
              <CardDescription>
                {t("owner.sponsors.description", "Manage and export sponsor information.")}
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => handleExportCSV('sponsorData')}
            >
              {t("owner.actions.export", "Export to CSV")}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("owner.sponsors.company", "Company")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("owner.sponsors.contact", "Contact Person")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("owner.sponsors.email", "Email")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("owner.sponsors.package", "Package")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sponsorData.map((sponsor, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sponsor.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sponsor.contactPerson}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sponsor.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sponsor.package}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
