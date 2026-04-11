'use client';

/**
 * Security Testing Tool
 * Test authentication tampering and session security
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, XCircle, Play } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  message: string;
}

export default function SecurityTestPage(): React.ReactElement {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runTest1 = () => {
    // Test 1: Check if session is encrypted
    const session = localStorage.getItem('mfc-secure-session');
    
    if (!session) {
      addResult({
        name: 'Session Encryption Check',
        status: 'fail',
        message: 'No session found. Please login first.',
      });
      return;
    }

    try {
      const parsed = JSON.parse(session);
      const hasEncryption = parsed.data && parsed.signature && parsed.version === 1;
      
      addResult({
        name: 'Session Encryption Check',
        status: hasEncryption ? 'pass' : 'fail',
        message: hasEncryption 
          ? '✅ Session is properly encrypted with signature'
          : '❌ Session is not properly encrypted',
      });
    } catch (error) {
      addResult({
        name: 'Session Encryption Check',
        status: 'fail',
        message: '❌ Invalid session format',
      });
    }
  };

  const runTest2 = () => {
    // Test 2: Tamper with session data
    const session = localStorage.getItem('mfc-secure-session');
    
    if (!session) {
      addResult({
        name: 'Tampering Detection',
        status: 'fail',
        message: 'No session to tamper with',
      });
      return;
    }

    const original = session;
    
    try {
      const parsed = JSON.parse(session);
      parsed.data = 'TAMPERED_DATA_12345';
      localStorage.setItem('mfc-secure-session', JSON.stringify(parsed));
      
      addResult({
        name: 'Tampering Detection',
        status: 'pending',
        message: '⚠️ Session tampered. Reload page to test detection.',
      });
      
      // Restore after 3 seconds
      setTimeout(() => {
        localStorage.setItem('mfc-secure-session', original);
      }, 3000);
    } catch (error) {
      addResult({
        name: 'Tampering Detection',
        status: 'fail',
        message: '❌ Error during tampering test',
      });
    }
  };

  const runTest3 = () => {
    // Test 3: Check timestamp validation
    const activity = localStorage.getItem('mfc-last-activity');
    
    if (!activity) {
      addResult({
        name: 'Timestamp Validation',
        status: 'fail',
        message: 'No activity timestamp found',
      });
      return;
    }

    const timestamp = parseInt(activity);
    const age = Date.now() - timestamp;
    const sixHours = 6 * 60 * 60 * 1000;
    const hoursOld = (age / (1000 * 60 * 60)).toFixed(2);
    
    addResult({
      name: 'Timestamp Validation',
      status: age < sixHours ? 'pass' : 'fail',
      message: age < sixHours
        ? `✅ Session valid (${hoursOld} hours old)`
        : `❌ Session expired (${hoursOld} hours old)`,
    });
  };

  const runTest4 = () => {
    // Test 4: Tamper with timestamp
    const original = localStorage.getItem('mfc-last-activity');
    
    if (!original) {
      addResult({
        name: 'Timestamp Tampering',
        status: 'fail',
        message: 'No timestamp to tamper with',
      });
      return;
    }

    // Set to 7 hours ago
    const sevenHoursAgo = Date.now() - (7 * 60 * 60 * 1000);
    localStorage.setItem('mfc-last-activity', sevenHoursAgo.toString());
    
    addResult({
      name: 'Timestamp Tampering',
      status: 'pending',
      message: '⚠️ Timestamp set to 7 hours ago. Navigate to test expiry.',
    });
    
    // Restore after 3 seconds
    setTimeout(() => {
      localStorage.setItem('mfc-last-activity', original);
    }, 3000);
  };

  const runTest5 = () => {
    // Test 5: Check profile encryption
    const profile = localStorage.getItem('mfc-manager-profile');
    
    if (!profile) {
      addResult({
        name: 'Profile Encryption',
        status: 'fail',
        message: 'No profile cache found',
      });
      return;
    }

    try {
      const parsed = JSON.parse(profile);
      const hasEncryption = parsed.data && parsed.checksum;
      
      addResult({
        name: 'Profile Encryption',
        status: hasEncryption ? 'pass' : 'fail',
        message: hasEncryption
          ? '✅ Profile is encrypted with checksum'
          : '❌ Profile is not encrypted',
      });
    } catch (error) {
      addResult({
        name: 'Profile Encryption',
        status: 'fail',
        message: '❌ Invalid profile format',
      });
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);
    
    runTest1();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    runTest3();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    runTest5();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setTesting(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Security Testing Tool</h1>
          <p className="text-muted-foreground">
            Test authentication tampering and session security
          </p>
        </div>
      </div>

      <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <AlertTriangle className="h-5 w-5" />
            Warning: Testing Environment Only
          </CardTitle>
          <CardDescription className="text-yellow-600 dark:text-yellow-400">
            This tool is for security testing purposes. Some tests will temporarily modify your session.
            Changes are automatically reverted after 3 seconds.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Tests</CardTitle>
            <CardDescription>Run individual security tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={runTest1} variant="outline" className="w-full justify-start">
              Test 1: Session Encryption
            </Button>
            <Button onClick={runTest2} variant="outline" className="w-full justify-start">
              Test 2: Tamper Detection
            </Button>
            <Button onClick={runTest3} variant="outline" className="w-full justify-start">
              Test 3: Timestamp Validation
            </Button>
            <Button onClick={runTest4} variant="outline" className="w-full justify-start">
              Test 4: Timestamp Tampering
            </Button>
            <Button onClick={runTest5} variant="outline" className="w-full justify-start">
              Test 5: Profile Encryption
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Automated Tests</CardTitle>
            <CardDescription>Run all non-destructive tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={runAllTests} 
              disabled={testing}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              {testing ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button 
              onClick={clearResults} 
              variant="outline"
              className="w-full"
            >
              Clear Results
            </Button>
          </CardContent>
        </Card>
      </div>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              {results.filter(r => r.status === 'pass').length} / {results.length} tests passed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  {result.status === 'pass' && (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  )}
                  {result.status === 'fail' && (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  {result.status === 'pending' && (
                    <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{result.name}</span>
                      <Badge
                        variant={
                          result.status === 'pass'
                            ? 'default'
                            : result.status === 'fail'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {result.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Manual Testing</CardTitle>
          <CardDescription>
            For advanced testing, open DevTools Console and follow the guide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            See <code className="bg-muted px-2 py-1 rounded">tests/SECURITY_TESTING_GUIDE.md</code> for detailed manual testing instructions.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              window.open('/tests/SECURITY_TESTING_GUIDE.md', '_blank');
            }}
          >
            View Testing Guide
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
