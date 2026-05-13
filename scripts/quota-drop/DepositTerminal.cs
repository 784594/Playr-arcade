using UnityEngine;

public class DepositTerminal : MonoBehaviour, IInteractable
{
    public string InteractionPrompt => "Secure your loose cash";

    public void Interact()
    {
        if (GameManager.Instance == null)
        {
            return;
        }

        GameManager.Instance.DepositCash();
    }
}
