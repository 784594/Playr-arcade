using UnityEngine;

public class SlotMachine : MonoBehaviour, IInteractable
{
    public string InteractionPrompt => "Spin the debt engine";

    [Range(0f, 1f)]
    public float jackpotChance = 0.06f;
    [Range(0f, 1f)]
    public float bigWinChance = 0.18f;
    [Range(0f, 1f)]
    public float mediumWinChance = 0.32f;
    [Range(0f, 1f)]
    public float lossRefundChance = 0.15f;

    public void Interact()
    {
        if (GameManager.Instance == null)
        {
            return;
        }

        GameManager.Instance.PlaySpin(jackpotChance, bigWinChance, mediumWinChance, lossRefundChance);
    }
}
