using UnityEngine;

public class TokenPrinter : MonoBehaviour, IInteractable
{
    public string InteractionPrompt => "Print maintenance tokens";

    public int cashCost = 120;
    public int tokenReward = 1;

    public void Interact()
    {
        if (GameManager.Instance == null)
        {
            return;
        }

        GameManager.Instance.BuyTokens(cashCost, tokenReward);
    }
}
