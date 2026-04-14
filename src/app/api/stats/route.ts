import { NextResponse } from 'next/server';
import os from 'os';
import { SystemStats } from '@/types';
import { getCurrentUser } from '@/lib/auth';

// Cache stats briefly to prevent system overload
let cachedStats: SystemStats | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 2000; // 2 seconds

async function getStatsFromSi(): Promise<SystemStats> {
    const si = (await import('systeminformation')).default;
    const [cpu, mem, time, fsSize, osInfo] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.time(),
        si.fsSize(),
        si.osInfo()
    ]);

    return {
        cpuLoad: Math.round(cpu.currentLoad),
        memTotal: mem.total,
        memUsed: mem.active,
        uptime: time.uptime,
        platform: osInfo.platform,
        storage: fsSize.map(drive => ({
            fs: drive.fs,
            size: drive.size,
            used: drive.used
        })).slice(0, 2)
    };
}

function getFallbackStats(): SystemStats {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const avgIdle = cpus.reduce((sum, cpu) => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        return sum + (cpu.times.idle / total);
    }, 0) / cpus.length;

    return {
        cpuLoad: Math.round((1 - avgIdle) * 100),
        memTotal: totalMem,
        memUsed: totalMem - freeMem,
        uptime: os.uptime(),
        platform: os.platform(),
        storage: []
    };
}

export async function GET() {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = Date.now();

    if (cachedStats && (now - lastFetchTime < CACHE_DURATION)) {
        return NextResponse.json(cachedStats);
    }

    try {
        // systeminformation uses sync fs.readFileSync('/proc/cpuinfo') on import/call
        // which throws an uncatchable uncaughtException on non-Linux platforms
        const isLinux = os.platform() === 'linux';
        const stats = isLinux ? await getStatsFromSi() : getFallbackStats();
        cachedStats = stats;
        lastFetchTime = now;
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Stats collection failed:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
