#include <cstdio>
#include <algorithm>
#include <cstring>

using namespace std;

#define multier 100.0

int huSet1[8023][20], huSet2[8023][20];
int wordSet1[300][20], wordSet2[300][20];

long double factorial(int n)
{
    long double res = (long double)(1.0);
    for (int i = 1; i <= n; ++i)
        res *= n;
    return res;
}

long double C(int n, int m)
{
    long double res = (long double)(1.0);
    for (int i = 1; i <= m; ++i)
        res = res * (i + n - m) / i;
    return res;
}

long double P(int n, int m)
{
    long double res = (long double)(1.0);
    for (int i = 1; i <= m; ++i)
        res = res * (i + n - m);
    return res;
}

int main()
{
    FILE *f1, *f2;
    f1 = fopen("sets1.txt", "r");
    char ch;
    int cnt1 = 0;
    int pos = 0;
    while ((ch = fgetc(f1)) != EOF)
    {
        if (ch == '\n')
        {
            cnt1++;
            pos = 0;
        }
        else
            huSet1[cnt1][pos++] = ch - '0';
    }
    fclose(f1);
    f2 = fopen("sets2.txt", "r");
    int cnt2 = 0;
    pos = 0;
    while ((ch = fgetc(f2)) != EOF)
    {
        if (ch == '\n')
        {
            cnt2++;
            pos = 0;
        }
        else
            huSet2[cnt2][pos++] = ch - '0';
    }
    fclose(f2);

    f1 = fopen("words1.txt", "r");
    int cnt3 = 0;
    pos = 0;
    while ((ch = fgetc(f1)) != EOF)
    {
        if (ch == '\n')
        {
            cnt3++;
            pos = 0;
        }
        else
            wordSet1[cnt3][pos++] = ch - '0';
    }
    fclose(f1);
    f2 = fopen("words2.txt", "r");
    int cnt4 = 0;
    pos = 0;
    while ((ch = fgetc(f2)) != EOF)
    {
        if (ch == '\n')
        {
            cnt4++;
            pos = 0;
        }
        else
            wordSet2[cnt4][pos++] = ch - '0';
    }
    fclose(f2);

    int last[35];
    for (int i = 0; i < 34; ++i)
        scanf("%d", &last[i]);
    int sum = 0;
    for (int i = 0; i < 34; ++i)
        sum += last[i];

    int cardLen = 0;
    int myCard[15];
    scanf("%d", &cardLen);

    int T = 0;
    scanf("%d", &T);
    while (T--)
    {
        for (int i = 0; i < cardLen; ++i)
            scanf("%d", &myCard[i]);
        int parts[5][12];
        memset(parts, 0, sizeof(parts));
        for (int i = 0; i < cardLen; ++i)
            parts[myCard[i] / 9][myCard[i] % 9]++;
        long double prob[8][14][14];
        memset(prob, 0, sizeof(prob));
        for (int i = 0; i < 3; ++i)
        {
            for (int j = 0; j < cnt1; ++j)
            {
                bool flag = false;
                int need[9];
                int need_sum = 0;
                int more[9];
                int more_sum = 0;
                memset(need, 0, sizeof(need));
                memset(more, 0, sizeof(more));
                for (int k = 0; k < 9; ++k)
                {
                    if (parts[i][k] > huSet1[j][k])
                        more[k] = parts[i][k] - huSet1[j][k];
                    else
                    {
                        need[k] = huSet1[j][k] - parts[i][k];
                        if (need[k] > last[i * 9 + k])
                        {
                            flag = true;
                            break;
                        }
                    }
                    need_sum += need[k];
                    more_sum += more[k];
                }
                if (flag)
                    continue;
                // prob = (C(need_sum,need[k])*P(last[i*9+k],need[k]))/P(sum,need_sum)
                long double p = (long double)(multier);
                int tmp = need_sum;
                for (int k = 0; k < 9; ++k)
                {
                    if (!need[k])
                        continue;
                    p *= C(need_sum, need[k]);
                    p *= P(last[i * 9 + k], need[k]);
                    need_sum -= need[k];
                }
                p /= P(sum, tmp);
                prob[i << 1][tmp][more_sum] = max(prob[i << 1][tmp][more_sum], p);
            }
            for (int j = 0; j < cnt2; ++j)
            {
                bool flag = false;
                int need[9];
                int need_sum = 0;
                int more[9];
                int more_sum = 0;
                memset(need, 0, sizeof(need));
                memset(more, 0, sizeof(more));
                for (int k = 0; k < 9; ++k)
                {
                    if (parts[i][k] > huSet2[j][k])
                        more[k] = parts[i][k] - huSet2[j][k];
                    else
                    {
                        need[k] = huSet2[j][k] - parts[i][k];
                        if (need[k] > last[i * 9 + k])
                        {
                            flag = true;
                            break;
                        }
                    }
                    need_sum += need[k];
                    more_sum += more[k];
                }
                if (flag)
                    continue;
                // prob = (C(need_sum,need[k])*P(last[i*9+k],need[k]))/P(sum,need_sum)
                long double p = (long double)(multier);
                int tmp = need_sum;
                for (int k = 0; k < 9; ++k)
                {
                    if (!need[k])
                        continue;
                    p *= C(need_sum, need[k]);
                    p *= P(last[i * 9 + k], need[k]);
                    need_sum -= need[k];
                }
                p /= P(sum, tmp);
                prob[(i << 1) | 1][tmp][more_sum] = max(prob[(i << 1) | 1][tmp][more_sum], p);
            }
        }
        for (int j = 0; j < cnt3; ++j)
        {
            bool flag = false;
            int need[7];
            int need_sum = 0;
            int more[7];
            int more_sum = 0;
            memset(need, 0, sizeof(need));
            memset(more, 0, sizeof(more));
            for (int k = 0; k < 7; ++k)
            {
                if (parts[3][k] > wordSet1[j][k])
                    more[k] = parts[3][k] - wordSet1[j][k];
                else
                {
                    need[k] = wordSet1[j][k] - parts[3][k];
                    if (need[k] > last[27 + k])
                    {
                        flag = true;
                        break;
                    }
                }
                need_sum += need[k];
                more_sum += more[k];
            }
            if (flag)
                continue;
            // prob = (C(need_sum,need[k])*P(last[i*9+k],need[k]))/P(sum,need_sum)
            long double p = (long double)(multier);
            int tmp = need_sum;
            for (int k = 0; k < 7; ++k)
            {
                if (!need[k])
                    continue;
                p *= C(need_sum, need[k]);
                p *= P(last[27 + k], need[k]);
                need_sum -= need[k];
            }
            p /= P(sum, tmp);
            prob[6][tmp][more_sum] = max(prob[6][tmp][more_sum], p);
        }
        for (int j = 0; j < cnt4; ++j)
        {
            bool flag = false;
            int need[7];
            int need_sum = 0;
            int more[7];
            int more_sum = 0;
            memset(need, 0, sizeof(need));
            memset(more, 0, sizeof(more));
            for (int k = 0; k < 7; ++k)
            {
                if (parts[3][k] > wordSet2[j][k])
                    more[k] = parts[3][k] - wordSet2[j][k];
                else
                {
                    need[k] = wordSet2[j][k] - parts[3][k];
                    if (need[k] > last[27 + k])
                    {
                        flag = true;
                        break;
                    }
                }
                need_sum += need[k];
                more_sum += more[k];
            }
            if (flag)
                continue;
            // prob = (C(need_sum,need[k])*P(last[i*9+k],need[k]))/P(sum,need_sum)
            long double p = (long double)(multier);
            int tmp = need_sum;
            for (int k = 0; k < 7; ++k)
            {
                if (!need[k])
                    continue;
                p *= C(need_sum, need[k]);
                p *= P(last[27 + k], need[k]);
                need_sum -= need[k];
            }
            p /= P(sum, tmp);
            prob[7][tmp][more_sum] = max(prob[7][tmp][more_sum], p);
        }
        long double maxP = 0;
        for (int i1 = 0; i1 <= 14; ++i1)
            for (int i2 = 0; i2 <= 14; ++i2)
                for (int i3 = 0; i3 <= 14; ++i3)
                    for (int i4 = 0; i4 <= 14; ++i4)
                        for (int i5 = 0; i5 <= 14; ++i5)
                            for (int i6 = 0; i6 <= 14; ++i6)
                                for (int i7 = 0; i7 <= 14; ++i7)
                                {
                                    if (i1 + i3 + i5 + i7 >= 14)
                                        break;
                                    int i8 = -i2 - i4 - i6 - 1 + i1 + i3 + i5 + i7;
                                    if (i8 < 0 || i8 > 14)
                                        continue;
                                    if (i2 + i4 + i6 + i8 >= cardLen)
                                        break;
                                    for (int j = 0; j < 4; ++j)
                                    {
                                        long double p = (long double)(1.0);
                                        p *= prob[0 | (int)(j == 0)][i1][i2];
                                        p *= prob[2 | (int)(j == 1)][i3][i4];
                                        p *= prob[4 | (int)(j == 2)][i5][i6];
                                        p *= prob[6 | (int)(j == 3)][i7][i8];
                                        maxP = max(p, maxP);
                                    }
                                }
        // printf("%.10Lf\n", prob[0][0][0] * prob[3][1][0] * prob[4][0][0] * prob[6][0][0]);
        printf("%.16Lf\n", maxP);
    }
    return 0;
}