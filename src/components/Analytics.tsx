
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Sample data for the chart
const applicationData = [
  { month: 'Jan', applications: 12 },
  { month: 'Feb', applications: 19 },
  { month: 'Mar', applications: 25 },
  { month: 'Apr', applications: 32 },
  { month: 'May', applications: 20 },
  { month: 'Jun', applications: 29 },
];

const jobMatchData = [
  { job: "Frontend Developer", matches: 15 },
  { job: "Backend Engineer", matches: 12 },
  { job: "DevOps Engineer", matches: 7 },
  { job: "Product Manager", matches: 4 },
  { job: "UX Designer", matches: 8 },
];

const skillsData = [
  { skill: "JavaScript", count: 24 },
  { skill: "React", count: 18 },
  { skill: "Python", count: 15 },
  { skill: "SQL", count: 12 },
  { skill: "AWS", count: 9 },
  { skill: "Java", count: 7 },
  { skill: "Node.js", count: 11 },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      <p className="text-muted-foreground">Track your hiring metrics and recruitment performance</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Applications Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applicationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications" fill="#4361EE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Skills</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="skill" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#F72585" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hiring Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Applications</span>
                <span className="font-semibold">124</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-jobspark-primary h-2.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span>Screened</span>
                <span className="font-semibold">87</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-jobspark-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span>Interviews</span>
                <span className="font-semibold">42</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-jobspark-primary h-2.5 rounded-full" style={{ width: '33%' }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span>Offers</span>
                <span className="font-semibold">15</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-jobspark-primary h-2.5 rounded-full" style={{ width: '12%' }}></div>
              </div>
              <div className="flex justify-between items-center">
                <span>Hires</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-jobspark-primary h-2.5 rounded-full" style={{ width: '6%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time to hire</span>
                  <span className="font-semibold">21 days</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1 mt-1">
                  <div className="bg-green-500 h-1 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost per hire</span>
                  <span className="font-semibold">$1,250</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1 mt-1">
                  <div className="bg-amber-500 h-1 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Offer acceptance rate</span>
                  <span className="font-semibold">72%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1 mt-1">
                  <div className="bg-jobspark-primary h-1 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Retention rate (6mo)</span>
                  <span className="font-semibold">85%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1 mt-1">
                  <div className="bg-green-500 h-1 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Job Posting Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobMatchData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="job" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="matches" fill="#3A0CA3" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
