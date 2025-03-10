
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Users, Search, TrendingUp, HeartPulse, BarChart3,
  List, Calendar, FileText, Download, Bell, Activity, Zap,
  DollarSign, ShieldCheck, Server, Pill, RefreshCw, 
  Settings, HelpCircle, Layers, LayoutDashboard, ChevronRight,
  ArrowUpRight, HelpingHand, BrainCircuit, FileHeart, Stethoscope
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
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

// Stats cards data
const statCards = [
  {
    title: "Patient Visits",
    value: 1842,
    change: "+12.5%",
    trend: "up",
    icon: <Users className="h-5 w-5" />,
    color: "from-blue-500 to-indigo-600"
  },
  {
    title: "Medication Searches",
    value: 743,
    change: "+8.2%",
    trend: "up",
    icon: <Pill className="h-5 w-5" />,
    color: "from-emerald-500 to-teal-600"
  },
  {
    title: "Patient Satisfaction",
    value: "94%",
    change: "+2.5%",
    trend: "up",
    icon: <HeartPulse className="h-5 w-5" />,
    color: "from-rose-500 to-pink-600"
  },
  {
    title: "Avg. Response Time",
    value: "2m 8s",
    change: "-14s",
    trend: "down",
    icon: <Activity className="h-5 w-5" />,
    color: "from-amber-500 to-orange-600"
  },
];

// Health insights data
const healthInsights = [
  {
    title: "Most Searched Condition",
    value: "Hypertension",
    change: "+5.3%",
    icon: <HeartPulse className="h-10 w-10 text-rose-500" />,
  },
  {
    title: "Top Medication",
    value: "Atorvastatin",
    change: "+3.2%",
    icon: <Pill className="h-10 w-10 text-emerald-500" />,
  },
  {
    title: "Top Specialist",
    value: "Cardiologist",
    change: "+8.1%",
    icon: <Stethoscope className="h-10 w-10 text-blue-500" />,
  },
];

// Sample pie chart data
const diagnosisData = [
  { name: "Cardiovascular", value: 35 },
  { name: "Respiratory", value: 25 },
  { name: "Endocrine", value: 20 },
  { name: "Neurological", value: 15 },
  { name: "Other", value: 5 },
];

const COLORS = ['#8B5CF6', '#10B981', '#F97316', '#0EA5E9', '#EC4899'];

const AdminDashboard = () => {
  const { isAdmin } = useAdmin();
  const { searchHistory } = useSearchHistory();
  const [activeVisitors, setActiveVisitors] = useState(42);
  const [totalSearches, setTotalSearches] = useState(0);
  const [topSearches, setTopSearches] = useState<{term: string, count: number}[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dailyStats, setDailyStats] = useState([
    { date: 'Mon', patients: 120, searches: 85, revenue: 1250 },
    { date: 'Tue', patients: 145, searches: 92, revenue: 1380 },
    { date: 'Wed', patients: 132, searches: 78, revenue: 1120 },
    { date: 'Thu', patients: 165, searches: 110, revenue: 1640 },
    { date: 'Fri', patients: 189, searches: 132, revenue: 1920 },
    { date: 'Sat', patients: 178, searches: 124, revenue: 1780 },
    { date: 'Sun', patients: 198, searches: 142, revenue: 2100 },
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
  }, [searchHistory]);

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
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50">
      {/* Overlay Patterns */}
      <div className="fixed inset-0 z-0 bg-gradient-radial from-indigo-100/30 to-transparent opacity-70"></div>
      <div className="fixed inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMzMDMwZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgOGgydi0yaC0ydjJ6bTItNGgydjJoLTJ2LTJ6bS0yLTR2Mmgydi0yaC0yem00IDBoMnYyaC0ydi0yem0yLTRoLTJ2MmgydjJoMnYtMmgydi0yaC0ydi0yaC0ydjJ6bTQgMGgydjJoLTJ2LTJ6bTIgNHYtMmgtMnYyaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>

      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="icon" className="rounded-full">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-health-pink text-transparent bg-clip-text">Health Admin</h1>
                <div className="flex items-center text-sm text-muted-foreground">
                  <LayoutDashboard className="h-3 w-3 mr-1" /> Dashboard
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="relative rounded-full">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {notificationCount}
                  </span>
                )}
              </Button>
              
              <Button variant="outline" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
              
              <Button variant="default" size="sm" onClick={downloadCSV} className="rounded-full flex items-center gap-2">
                <Download className="h-4 w-4" /> 
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, i) => (
            <Card key={i} className="overflow-hidden border-none shadow-lg bg-gradient-to-br backdrop-blur-md bg-white/50 hover:bg-white/70 transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex flex-col">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-xs">
                  <Badge 
                    variant="outline" 
                    className={`${
                      stat.trend === 'up' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    } flex items-center gap-1 mr-2`}
                  >
                    {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    {stat.change}
                  </Badge>
                  <span className="text-muted-foreground">from last week</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Main Chart */}
          <Card className="lg:col-span-2 border shadow-md bg-white/80 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Weekly patient visits and searches</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Calendar className="h-4 w-4 mr-2" /> Last 7 days
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyStats}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      borderRadius: '0.5rem',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="patients" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPatients)" 
                    name="Patient Visits"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="searches" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSearches)"
                    name="Medication Searches" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Health Insights */}
          <Card className="border shadow-md bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Health Insights</CardTitle>
              <CardDescription>Key trends and metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {healthInsights.map((insight, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-foreground to-white/90 shadow-md">
                      {insight.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{insight.title}</p>
                      <p className="text-xl font-semibold">{insight.value}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {insight.change}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Diagnosis Distribution */}
          <Card className="border shadow-md bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Diagnosis Distribution</CardTitle>
              <CardDescription>Major categories of diagnoses</CardDescription>
            </CardHeader>
            <CardContent className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diagnosisData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {diagnosisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, name]}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      borderRadius: '0.5rem',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Searches */}
          <Card className="border shadow-md bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Top Searches</CardTitle>
              <CardDescription>Most frequent search terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSearches.length > 0 ? (
                  <div className="relative">
                    {topSearches.map((search, i) => {
                      const percentage = Math.round((search.count / topSearches[0].count) * 100);
                      return (
                        <div key={i} className="mb-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium truncate max-w-[70%]">
                              {i + 1}. {search.term}
                            </span>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {search.count}
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-primary to-health-pink animate-pulse"
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

          {/* Revenue Overview */}
          <Card className="border shadow-md bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Weekly transaction data</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyStats}
                  margin={{ top: 10, right: 0, left: 0, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      borderRadius: '0.5rem',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="url(#colorRevenue)" 
                    radius={[4, 4, 0, 0]}
                    name="Revenue" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activity" className="mb-6">
          <TabsList className="w-full grid sm:grid-cols-3 bg-white/70 border backdrop-blur-sm rounded-full p-1">
            <TabsTrigger value="activity" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="h-4 w-4 mr-2" />
              <span>Search Activity</span>
            </TabsTrigger>
            <TabsTrigger value="admin-tasks" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <List className="h-4 w-4 mr-2" />
              <span>Admin Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="system-status" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Server className="h-4 w-4 mr-2" />
              <span>System Status</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity">
            <Card className="border shadow-md bg-white/80 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Search Activity</CardTitle>
                  <CardDescription>Latest user searches</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Filter searches..." 
                    className="pl-9 w-[250px] rounded-full bg-white/70" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/20">
                        <th className="text-left p-4 font-medium text-muted-foreground">Query</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Time</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredSearches.length > 0 ? (
                        filteredSearches.map((activity, i) => (
                          <tr key={i} className="hover:bg-muted/10 transition-colors">
                            <td className="p-4 flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <Search className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium">{activity.query}</span>
                            </td>
                            <td className="p-4 text-muted-foreground">{activity.timestamp}</td>
                            <td className="p-4">
                              <Button variant="outline" size="sm" className="rounded-full h-8">View Details</Button>
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
                <Button variant="outline" size="sm" className="rounded-full flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={downloadCSV} className="rounded-full flex items-center gap-2">
                  <Download className="h-4 w-4" /> 
                  Export All
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="admin-tasks">
            <Card className="border shadow-md bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Admin Tasks</CardTitle>
                <CardDescription>Things that need your attention</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <div className="flex items-start gap-4 p-4 hover:bg-muted/10 transition-colors">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Update medication pricing</p>
                      <p className="text-sm text-muted-foreground mb-2">Prices need to be adjusted for the summer season</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200">High Priority</Badge>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Pricing</Badge>
                      </div>
                    </div>
                    <Button className="flex items-center gap-2 rounded-full shadow-md">
                      <Zap className="h-4 w-4" />
                      Assign
                    </Button>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 hover:bg-muted/10 transition-colors">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-md">
                      <HelpingHand className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Review specialist information</p>
                      <p className="text-sm text-muted-foreground mb-2">3 specialists need information updates</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Normal Priority</Badge>
                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">Content</Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="flex items-center gap-2 rounded-full">
                      <FileHeart className="h-4 w-4" />
                      Review
                    </Button>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 hover:bg-muted/10 transition-colors">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white shadow-md">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Security audit report</p>
                      <p className="text-sm text-muted-foreground mb-2">Review quarterly security assessment findings</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Critical</Badge>
                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200">Security</Badge>
                      </div>
                    </div>
                    <Button variant="outline" className="flex items-center gap-2 rounded-full">
                      <BrainCircuit className="h-4 w-4" />
                      View Report
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <Button className="w-full bg-gradient-to-r from-primary to-health-pink hover:opacity-90 transition-all rounded-full shadow-md">
                  <Layers className="mr-2 h-4 w-4" />
                  View All Tasks
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="system-status">
            <Card className="border shadow-md bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 rounded-lg border bg-white/60 backdrop-blur-sm shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white">
                          <Zap className="h-5 w-5" />
                        </div>
                        <span className="font-medium">API Status</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Operational</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 rounded-lg border bg-white/60 backdrop-blur-sm shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white">
                          <Search className="h-5 w-5" />
                        </div>
                        <span className="font-medium">Search Engine</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Operational</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 rounded-lg border bg-white/60 backdrop-blur-sm shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white">
                          <Server className="h-5 w-5" />
                        </div>
                        <span className="font-medium">Database</span>
                      </div>
                      <Badge className={getStatusColor(systemHealth.memory)}>
                        {systemHealth.memory > 80 ? "High Load" : "Operational"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 rounded-lg border bg-white/60 backdrop-blur-sm shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <span className="font-medium">Payment Processing</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Operational</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Incident History</h3>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border bg-white/60 backdrop-blur-sm shadow-sm">
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
                    
                    <div className="p-4 rounded-lg border bg-white/60 backdrop-blur-sm shadow-sm">
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
                <Button variant="outline" className="rounded-full flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Status
                </Button>
                <Button variant="outline" className="rounded-full flex items-center gap-2">
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
