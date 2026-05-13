using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance;

    public int currentQuota = 1000;
    public int totalDeposited = 0;
    public int currentCash = 240;
    public int roundsLeft = 5;
    public int maintenanceTokens = 0;
    public int currentSpinCost = 40;
    public float payoutMultiplier = 1f;
    public bool dispatchBuffAvailable = true;
    public string lastStatusMessage = "Reach quota before the room is reclaimed.";

    void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
        }
        else if (Instance != this)
        {
            Destroy(gameObject);
        }
    }

    public void DepositCash()
    {
        if (currentCash <= 0)
        {
            LogStatus("You have no loose cash to secure.");
            return;
        }

        totalDeposited += currentCash;
        LogStatus("Cash secured. Total deposited: $" + totalDeposited);
        currentCash = 0;
    }

    public void PlaySpin(float jackpotChance, float bigWinChance, float mediumWinChance, float lossRefundChance)
    {
        if (roundsLeft <= 0)
        {
            LogStatus("The run is over. Reset the scene or raise new quota rules.");
            return;
        }

        if (currentCash < currentSpinCost)
        {
            LogStatus("Not enough loose cash for a spin. Current cost: $" + currentSpinCost);
            return;
        }

        currentCash -= currentSpinCost;
        roundsLeft--;

        float roll = Random.value;
        int payout = 0;
        string resultLabel = "blank";

        if (roll <= jackpotChance)
        {
            payout = Mathf.RoundToInt(currentSpinCost * 12f * payoutMultiplier);
            maintenanceTokens += 2;
            resultLabel = "jackpot";
        }
        else if (roll <= jackpotChance + bigWinChance)
        {
            payout = Mathf.RoundToInt(currentSpinCost * 4.5f * payoutMultiplier);
            maintenanceTokens += 1;
            resultLabel = "big win";
        }
        else if (roll <= jackpotChance + bigWinChance + mediumWinChance)
        {
            payout = Mathf.RoundToInt(currentSpinCost * 2f * payoutMultiplier);
            resultLabel = "clean hit";
        }
        else if (roll <= jackpotChance + bigWinChance + mediumWinChance + lossRefundChance)
        {
            payout = Mathf.RoundToInt(currentSpinCost * 0.5f);
            resultLabel = "partial refund";
        }

        currentCash += payout;
        dispatchBuffAvailable = true;

        LogStatus(
            "Spin result: " + resultLabel +
            ". Payout: $" + payout +
            ". Loose cash: $" + currentCash +
            ". Rounds left: " + roundsLeft
        );

        if (roundsLeft <= 0)
        {
            ResolveDeadline();
        }
    }

    public void ResolveDispatchCall()
    {
        if (!dispatchBuffAvailable)
        {
            LogStatus("Dispatch is silent for now. Try again after your next spin.");
            return;
        }

        dispatchBuffAvailable = false;
        int outcome = Random.Range(0, 4);

        switch (outcome)
        {
            case 0:
                payoutMultiplier += 0.35f;
                LogStatus("Dispatch spikes machine voltage. Payout multiplier is now x" + payoutMultiplier.ToString("0.00"));
                break;
            case 1:
                currentCash += 180;
                LogStatus("Dispatch drops emergency bills into the room. Loose cash: $" + currentCash);
                break;
            case 2:
                maintenanceTokens += 2;
                LogStatus("Dispatch authorizes 2 maintenance tokens. Tokens: " + maintenanceTokens);
                break;
            default:
                currentSpinCost = Mathf.Max(15, currentSpinCost - 10);
                LogStatus("Dispatch cuts spin cost for the next stretch. Spin cost: $" + currentSpinCost);
                break;
        }
    }

    public void BuyTokens(int cashCost, int tokenReward)
    {
        if (currentCash < cashCost)
        {
            LogStatus("Not enough loose cash to print tokens.");
            return;
        }

        currentCash -= cashCost;
        maintenanceTokens += tokenReward;
        LogStatus("Printed " + tokenReward + " token(s). Tokens: " + maintenanceTokens + ". Loose cash: $" + currentCash);
    }

    public void ResolveDeadline()
    {
        if (totalDeposited >= currentQuota)
        {
            totalDeposited -= currentQuota;
            currentQuota = Mathf.RoundToInt(currentQuota * 1.45f);
            roundsLeft = 5;
            currentSpinCost += 15;
            payoutMultiplier = Mathf.Max(1f, payoutMultiplier - 0.2f);
            dispatchBuffAvailable = true;

            LogStatus("Quota cleared. New quota: $" + currentQuota + ". Deposited carryover: $" + totalDeposited);
            return;
        }

        LogStatus("Quota missed. The overhead reclaimer activates. Final deposited: $" + totalDeposited + " / $" + currentQuota);
    }

    public void LogStatus(string message)
    {
        lastStatusMessage = message;
        Debug.Log(message);
    }

    void OnGUI()
    {
        GUI.color = Color.white;

        GUI.Box(new Rect(14f, 14f, 360f, 150f), string.Empty);
        GUI.Label(new Rect(26f, 24f, 320f, 22f), "Quota: $" + currentQuota);
        GUI.Label(new Rect(26f, 46f, 320f, 22f), "Deposited: $" + totalDeposited);
        GUI.Label(new Rect(26f, 68f, 320f, 22f), "Loose Cash: $" + currentCash);
        GUI.Label(new Rect(26f, 90f, 320f, 22f), "Spin Cost: $" + currentSpinCost + "   Tokens: " + maintenanceTokens);
        GUI.Label(new Rect(26f, 112f, 320f, 22f), "Rounds Left: " + roundsLeft + "   Multiplier: x" + payoutMultiplier.ToString("0.00"));

        GUI.Box(new Rect(14f, Screen.height - 92f, 560f, 70f), string.Empty);
        GUI.Label(new Rect(26f, Screen.height - 80f, 532f, 22f), "Status");
        GUI.Label(new Rect(26f, Screen.height - 56f, 532f, 40f), lastStatusMessage);
    }
}
