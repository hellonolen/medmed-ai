import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Users, Search, TrendingUp, Clock, BarChart3, 
  List, Calendar, FileText, Download
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/contexts/AdminContext";
import { useSearchHistory } from "@/contexts/SearchHistoryContext";

const AdminDashboard = () => {
  const { isAdmin } = useAdmin();
  const { searchHistory } = useSearchHistory();
  const [activeVisitors, setActiveVisitors] = useState(42);
  const [totalSearches, setTotalSearches] = useState(0);
  const [topSearches, setTopSearches] = useState<{term: string, count: number}[]>([]);
  const [dailyStats, setDailyStats] = useState([
    { date: '2023-06-01', visitors: 120, searches: 85 },
    { date: '2023-06-02', visitors: 145, searches: 92 },
    { date: '2023-06-03', visitors: 132, searches: 78 },
    { date: '2023-06-04', visitors: 165, searches: 110 },
    { date: '2023-06-05', visitors: 189, searches: 132 },
    { date: '2023-06-06', visitors: 178, searches: 124 },
    { date: '2023-06-07', visitors: 198, searches: 142 },
  ]);
  const [recentSearchActivity, setRecentSearchActivity] = useState<{query: string, timestamp: string}[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      // Redirect if not admin
      window.location.href = '/';
      return;
    }

    // Process search history data
    if (searchHistory && searchHistory.length > 0) {
      // Update total searches
      setTotalSearches(searchHistory.length);
      
      // Update recent search activity
      const recentActivity = [...searchHistory].reverse().slice(0, 10).map(item => ({
        query: item.query,
        timestamp: new Date(item.timestamp).toLocaleString()
      }));
      setRecentSearchActivity(recentActivity);
      
      // Calculate top searches
      const searchCounts = searchHistory.reduce((acc, curr) => {
        const term = curr.query;
        if (!term) return acc; // Skip empty queries
        acc[term] = (acc[term] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topSearchResults = Object.entries(searchCounts)
        .map(([term, count]) => ({ term, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setTopSearches(topSearchResults);
    }

    // In a real app, we would fetch actual visitor data from an analytics service
    const interval = setInterval(() => {
      // Simulate fluctuating visitor count
      setActiveVisitors(prev => Math.max(35, Math.min(50, prev + Math.floor(Math.random() * 7) - 3)));
    }, 10000);

    return () => clearInterval(interval);
  }, [isAdmin, searchHistory]);

  const downloadCSV = () => {
    if (!searchHistory || searchHistory.length === 0) return;
    
    // Create CSV content
    const headers = ['Query', 'Results Count', 'Timestamp'];
    const csvRows = [
      headers.join(','),
      ...searchHistory.map(item => 
        [
          `"${item.query}"`, 
          item.resultsCount, 
          new Date(item.timestamp).toISOString()
        ].join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `search_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
        </div>
        <Button variant="outline" size="sm" onClick={downloadCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" /> 
          Export Search Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVisitors}</div>
            <p className="text-xs text-muted-foreground">Live now</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSearches}</div>
            <p className="text-xs text-muted-foreground">Since tracking began</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24%</div>
            <p className="text-xs text-muted-foreground">+5.2% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3m 42s</div>
            <p className="text-xs text-muted-foreground">-12s from last week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="search-activity">Search Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Top Searches</CardTitle>
                <CardDescription>Most frequent search terms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topSearches.length > 0 ? (
                    topSearches.map((search, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{i + 1}.</span>
                          <span>{search.term}</span>
                        </div>
                        <Badge variant="secondary">{search.count}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No search data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Daily Statistics</CardTitle>
                <CardDescription>Visitor and search activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyStats.map((day, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{day.date}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {day.visitors}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Search className="h-3 w-3" /> {day.searches}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="search-activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Search Activity</CardTitle>
              <CardDescription>Latest user searches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSearchActivity.length > 0 ? (
                  recentSearchActivity.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span>"{activity.query}"</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No recent searches</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" onClick={downloadCSV}>
                Export All Search Data
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>Performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Analytics charts coming soon</h3>
                <p className="text-muted-foreground">
                  Detailed analytics visualization will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Admin Tasks</CardTitle>
            <CardDescription>Things that need your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Update medication pricing</p>
                  <p className="text-sm text-muted-foreground">Prices need to be adjusted for the summer season</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                <List className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Review specialist information</p>
                  <p className="text-sm text-muted-foreground">3 specialists need information updates</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">API Status</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Operational</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Search Engine</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Operational</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Operational</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
