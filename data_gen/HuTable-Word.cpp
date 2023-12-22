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
int tot = 0;

// Array(8)，有对子/无对子+龙0123

inline void dfs(int u, int sum, int sum2)
{
    if (u > 4)
    {
        if (tot)
            putchar(',');
        tot++;
        putchar('"');
        for (int i = 0; i <= 4; ++i)
            putchar('0' + cnt[i]);
        putchar('"');
        putchar(':');
        putchar('[');
        for (int i = 0; i <= 1; ++i)
        {
            for (int j = 0; j < 4; ++j)
            {
                if (i + j)
                    putchar(',');
                if (cnt[4] > 0)
                    printf("false");
                else
                {
                    int need = 2 * cnt[1] + 1 * cnt[2];
                    if (i == 0)
                    {
                        need -= 1;
                        if (need < 0)
                            need += 3;
                    }
                    if (need == j || need + 3 == j)
                        printf("true");
                    else
                        printf("false");
                }
            }
        }
        putchar(']');
    }
    else
    {
        for (int i = 0; i <= 7; ++i)
            if (sum + i * u <= 14 && sum2 + i <= 7)
            {
                cnt[u] = i;
                dfs(u + 1, sum + i * u, sum2 + i);
            }
    }
}

int main()
{
    freopen("data2.js", "w", stdout);
    putchar('a');
    putchar('=');
    putchar('{');
    dfs(0, 0, 0);
    putchar('}');
    putchar('\n');
    printf("module.exports={a}");
    return 0;
}
