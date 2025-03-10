
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Users, Search, TrendingUp, Clock, BarChart3,
  List, Calendar, FileText, Download, Bell, Activity,
  Zap, DollarSign, ShieldCheck, Server, UserPlus, 
  RefreshCw, Settings, HelpCircle, Layers
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
import { Input } from "@/components/ui/input";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

const AdminDashboard = () => {
  const { isAdmin } = useAdmin();
  const { searchHistory } = useSearchHistory();
  const [activeVisitors, setActiveVisitors] = useState(42);
  const [totalSearches, setTotalSearches] = useState(0);
  const [topSearches, setTopSearches] = useState<{term: string, count: number}[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dailyStats, setDailyStats] = useState([
    { date: '2023-06-01', visitors: 120, searches: 85, revenue: 1250 },
    { date: '2023-06-02', visitors: 145, searches: 92, revenue: 1380 },
    { date: '2023-06-03', visitors: 132, searches: 78, revenue: 1120 },
    { date: '2023-06-04', visitors: 165, searches: 110, revenue: 1640 },
    { date: '2023-06-05', visitors: 189, searches: 132, revenue: 1920 },
    { date: '2023-06-06', visitors: 178, searches: 124, revenue: 1780 },
    { date: '2023-06-07', visitors: 198, searches: 142, revenue: 2100 },
  ]);
  const [recentSearchActivity, setRecentSearchActivity] = useState<{query: string, timestamp: string}[]>([]);
  const [notificationCount, setNotificationCount] = useState(3);
  const [systemHealth, setSystemHealth] = useState({
    cpu: 32,
    memory: 45,
    disk: 68,
    network: 23
  });

  useEffect(() => {
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

    // Simulate fluctuating visitor count
    const interval = setInterval(() => {
      setActiveVisitors(prev => Math.max(35, Math.min(50, prev + Math.floor(Math.random() * 7) - 3)));
      
      // Update system health randomly
      setSystemHealth(prev => ({
        cpu: Math.min(100, Math.max(5, prev.cpu + (Math.random() * 10 - 5))),
        memory: Math.min(100, Math.max(10, prev.memory + (Math.random() * 8 - 4))),
        disk: Math.min(100, Math.max(20, prev.disk + (Math.random() * 3 - 1.5))),
        network: Math.min(100, Math.max(5, prev.network + (Math.random() * 12 - 6)))
      }));
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

  const getStatusColor = (value: number) => {
    if (value < 50) return "bg-green-100 text-green-800 border-green-300";
    if (value < 80) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const filteredSearches = recentSearchActivity.filter(item => 
    item.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {notificationCount}
                  </span>
                )}
              </Button>
              
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              
              <Button variant="outline" size="sm" onClick={downloadCSV} className="flex items-center gap-2">
                <Download className="h-4 w-4" /> 
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-blue-500 to-violet-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
              <Users className="h-5 w-5 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeVisitors}</div>
              <p className="text-xs text-white/70">Live now • {activeVisitors > 40 ? "Peak traffic" : "Normal traffic"}</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
              <Search className="h-5 w-5 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSearches}</div>
              <p className="text-xs text-white/70">Since tracking began • {Math.round(totalSearches/7)} avg/day</p>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24%</div>
              <div className="flex items-center text-xs">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-200 text-green-800 mr-2">
                  +5.2%
                </span>
                <span className="text-white/70">from last week</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
              <Clock className="h-5 w-5 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3m 42s</div>
              <div className="flex items-center text-xs">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-200 text-red-800 mr-2">
                  -12s
                </span>
                <span className="text-white/70">from last week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Daily visitor and search trends</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyStats}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorVisitors)" 
                    name="Visitors"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="searches" 
                    stroke="#82ca9d" 
                    fillOpacity={1} 
                    fill="url(#colorSearches)"
                    name="Searches" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="col-span-1 border shadow-sm">
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Current resource utilization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">CPU</span>
                  <span className="text-sm font-medium">{Math.round(systemHealth.cpu)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full bg-blue-600" 
                    style={{ width: `${systemHealth.cpu}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Memory</span>
                  <span className="text-sm font-medium">{Math.round(systemHealth.memory)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full bg-green-600" 
                    style={{ width: `${systemHealth.memory}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Disk</span>
                  <span className="text-sm font-medium">{Math.round(systemHealth.disk)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${systemHealth.disk > 75 ? 'bg-red-600' : 'bg-yellow-600'}`}
                    style={{ width: `${systemHealth.disk}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Network</span>
                  <span className="text-sm font-medium">{Math.round(systemHealth.network)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="h-2.5 rounded-full bg-purple-600" 
                    style={{ width: `${systemHealth.network}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 border shadow-sm">
            <CardHeader>
              <CardTitle>Top Searches</CardTitle>
              <CardDescription>Most frequent search terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSearches.length > 0 ? (
                  <div className="relative pt-1">
                    {topSearches.map((search, i) => {
                      const percentage = Math.round((search.count / topSearches[0].count) * 100);
                      return (
                        <div key={i} className="mb-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium truncate max-w-[70%]">
                              {i + 1}. {search.term}
                            </span>
                            <Badge variant="secondary">{search.count}</Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40">
                    <Search className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-muted-foreground">No search data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 border shadow-sm">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Daily transaction data</CardDescription>
            </CardHeader>
            <CardContent className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyStats}
                  margin={{ top: 10, right: 0, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end"
                    height={50}
                    tickMargin={8}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Revenue']}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#F97316" 
                    radius={[4, 4, 0, 0]}
                    name="Revenue" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="search-activity" className="mb-6">
          <TabsList className="w-full grid sm:grid-cols-3 bg-white border">
            <TabsTrigger value="search-activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Search Activity</span>
            </TabsTrigger>
            <TabsTrigger value="admin-tasks" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span>Admin Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="system-status" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span>System Status</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="search-activity">
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Search Activity</CardTitle>
                  <CardDescription>Latest user searches</CardDescription>
                </div>
                <Input 
                  placeholder="Filter searches..." 
                  className="max-w-xs" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-4 font-medium text-muted-foreground">Query</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Time</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSearches.length > 0 ? (
                        filteredSearches.map((activity, i) => (
                          <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                            <td className="p-4 flex items-center gap-2">
                              <Search className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{activity.query}</span>
                            </td>
                            <td className="p-4 text-muted-foreground">{activity.timestamp}</td>
                            <td className="p-4">
                              <Button variant="ghost" size="sm" className="h-8">View Details</Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center p-8 text-muted-foreground">
                            {searchQuery ? "No matching searches found" : "No recent searches"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 flex justify-between">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={downloadCSV} className="flex items-center gap-2">
                  <Download className="h-4 w-4" /> 
                  Export All
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="admin-tasks">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Admin Tasks</CardTitle>
                <CardDescription>Things that need your attention</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <div className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">Update medication pricing</p>
                      <p className="text-sm text-muted-foreground mb-2">Prices need to be adjusted for the summer season</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">High Priority</Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pricing</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">Assign</Button>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <UserPlus className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Review specialist information</p>
                      <p className="text-sm text-muted-foreground mb-2">3 specialists need information updates</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Normal Priority</Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Content</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">Review</Button>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                      <ShieldCheck className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Security audit report</p>
                      <p className="text-sm text-muted-foreground mb-2">Review quarterly security assessment findings</p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Critical</Badge>
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Security</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">View Report</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <Button className="w-full">
                  <Layers className="mr-2 h-4 w-4" />
                  View All Tasks
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="system-status">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">API Status</span>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Operational</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Search className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">Search Engine</span>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Operational</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Server className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">Database</span>
                      </div>
                      <Badge variant="outline" className={getStatusColor(systemHealth.memory)}>
                        {systemHealth.memory > 80 ? "High Load" : "Operational"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <DollarSign className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">Payment Processing</span>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Operational</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Incident History</h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Resolved</Badge>
                          <h4 className="font-medium">Search Engine Latency</h4>
                        </div>
                        <span className="text-sm text-muted-foreground">2023-06-02</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        High latency on search responses impacted user experience. Issue was resolved by increasing cache size.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Resolved</Badge>
                          <h4 className="font-medium">Database Connection Issues</h4>
                        </div>
                        <span className="text-sm text-muted-foreground">2023-05-27</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Intermittent database connection failures resulted in brief service disruption. Connection pool settings were adjusted.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 flex justify-between">
                <Button variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Status
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Support Center
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
