/**
 * Mahjong
 * gen1.cpp
 *
 * CopyRight (c) 2023 yemaster(PB23151830)
 */
#include <cstdio>
#include <cstdlib>

using namespace std;

int cnt[10];
int q[10];

// Array(8)，有对子/无对子+龙0123

inline bool check(int z)
{
    if (z >= 10)
        return true;
    if (q[z] > 0)
    {
        bool flag;
        if (z + 2 <= 9 && q[z + 1] > 0 && q[z + 2] > 0)
        {
            q[z] -= 1;
            q[z + 1] -= 1;
            q[z + 2] -= 1;
            flag = check(z);
            q[z] += 1;
            q[z + 1] += 1;
            q[z + 2] += 1;
            if (flag)
                return true;
        }
        if (q[z] >= 3)
        {
            q[z] -= 3;
            flag = check(z);
            q[z] += 3;
            if (flag)
                return true;
        }
        return false;
    }
    else
        return check(z + 1);
}

inline bool check_dz(bool dz, int sum)
{
    if (dz)
    {
        for (int i = 1; i <= 9; ++i)
        {
            if (q[i] < 2)
                continue;
            q[i] -= 2;
            bool flag = check(1);
            q[i] += 2;
            if (flag)
                return true;
        }
    }
    else
    {
        if (check(1))
            return true;
    }
    return false;
}

inline bool check_dragon(bool dz, int dragon, int sum)
{
    if (dragon + sum > 14)
        return false;
    if (dragon > 0)
    {
        for (int i = 1; i <= 9; ++i)
            if (q[i] < 4)
            {
                q[i] += 1;
                bool flag = check_dragon(dz, dragon - 1, sum);
                q[i] -= 1;
                if (flag)
                    return true;
            }
        return false;
    }
    else
    {
        return check_dz(dz, sum);
    }
}

inline void dfs(int u, int sum)
{
    if (u > 9)
    {
        if (sum)
            putchar(',');
        putchar('"');
        for (int i = 1; i <= 9; ++i)
            putchar('0' + cnt[i]);
        putchar('"');
        putchar(':');
        putchar('[');
        for (int j = 0; j < 8; ++j)
        {
            for (int i = 1; i <= 9; ++i)
                q[i] = cnt[i];
            if (check_dragon(j <= 3, j % 4, sum))
                printf("true");
            else
                printf("false");
            if (j < 7)
                putchar(',');
        }
        putchar(']');
        // exit(0);
        return;
    }
    for (int i = 0; i <= 4; ++i)
    {
        if (sum + i <= 14)
        {
            cnt[u] = i;
            dfs(u + 1, sum + i);
        }
    }
}

int main()
{
    freopen("data.js", "w", stdout);
    putchar('h');
    putchar('=');
    putchar('{');
    dfs(1, 0);
    putchar('}');
    putchar('\n');
    printf("module.exports={h}");
    return 0;
}
