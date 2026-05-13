using UnityEngine;

public class OverheadReclaimer : MonoBehaviour, IInteractable
{
    public string InteractionPrompt => "Inspect the reclamation rig";

    public void Interact()
    {
        if (GameManager.Instance == null)
        {
            return;
        }

        GameManager.Instance.LogStatus("The overhead reclaimer hums above you. Miss quota and it will collect the room.");
    }
}
