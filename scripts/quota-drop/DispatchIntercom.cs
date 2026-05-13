using UnityEngine;

public class DispatchIntercom : MonoBehaviour, IInteractable
{
    public string InteractionPrompt => "Request a dispatch ruling";

    public void Interact()
    {
        if (GameManager.Instance == null)
        {
            return;
        }

        GameManager.Instance.ResolveDispatchCall();
    }
}
