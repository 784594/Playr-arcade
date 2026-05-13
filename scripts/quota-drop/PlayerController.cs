using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class PlayerController : MonoBehaviour
{
    public float mouseSensitivity = 2f;
    public float moveSpeed = 5.5f;
    public float sprintSpeed = 8f;
    public float gravity = -18f;
    public float interactionDistance = 3f;
    public Transform playerCamera;
    public bool drawCrosshair = true;

    private CharacterController characterController;
    private IInteractable currentInteractable;
    private string currentPrompt = string.Empty;
    private float verticalVelocity;

    private float xRotation = 0f;

    void Start()
    {
        characterController = GetComponent<CharacterController>();
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
    }

    void Update()
    {
        HandleMovement();
        HandleLook();
        HandleInteractionScan();
        HandleInteractionInput();
        HandleCursorToggle();
    }

    void HandleMovement()
    {
        float inputX = Input.GetAxisRaw("Horizontal");
        float inputZ = Input.GetAxisRaw("Vertical");

        Vector3 move = (transform.right * inputX + transform.forward * inputZ).normalized;
        float currentSpeed = Input.GetKey(KeyCode.LeftShift) ? sprintSpeed : moveSpeed;

        if (characterController.isGrounded && verticalVelocity < 0f)
        {
            verticalVelocity = -2f;
        }

        verticalVelocity += gravity * Time.deltaTime;

        Vector3 velocity = move * currentSpeed;
        velocity.y = verticalVelocity;
        characterController.Move(velocity * Time.deltaTime);
    }

    void HandleLook()
    {
        float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity;
        float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity;

        xRotation -= mouseY;
        xRotation = Mathf.Clamp(xRotation, -90f, 90f);

        playerCamera.localRotation = Quaternion.Euler(xRotation, 0f, 0f);
        transform.Rotate(Vector3.up * mouseX);
    }

    void HandleInteractionScan()
    {
        currentInteractable = null;
        currentPrompt = string.Empty;

        Ray ray = new Ray(playerCamera.position, playerCamera.forward);
        if (Physics.Raycast(ray, out RaycastHit hit, interactionDistance))
        {
            if (hit.collider.TryGetComponent(out IInteractable interactable))
            {
                currentInteractable = interactable;
                currentPrompt = interactable.InteractionPrompt;
            }
        }
    }

    void HandleInteractionInput()
    {
        if (currentInteractable != null && Input.GetKeyDown(KeyCode.E))
        {
            currentInteractable.Interact();
        }
    }

    void HandleCursorToggle()
    {
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            bool shouldUnlock = Cursor.lockState == CursorLockMode.Locked;
            Cursor.lockState = shouldUnlock ? CursorLockMode.None : CursorLockMode.Locked;
            Cursor.visible = shouldUnlock;
        }
    }

    void OnGUI()
    {
        if (drawCrosshair)
        {
            float centerX = Screen.width * 0.5f;
            float centerY = Screen.height * 0.5f;
            GUI.color = new Color(0.92f, 0.18f, 0.14f, 0.95f);
            GUI.DrawTexture(new Rect(centerX - 1f, centerY - 10f, 2f, 20f), Texture2D.whiteTexture);
            GUI.DrawTexture(new Rect(centerX - 10f, centerY - 1f, 20f, 2f), Texture2D.whiteTexture);
        }

        if (!string.IsNullOrEmpty(currentPrompt))
        {
            GUI.color = Color.white;
            GUIStyle boxStyle = new GUIStyle(GUI.skin.box);
            boxStyle.alignment = TextAnchor.MiddleCenter;
            boxStyle.fontSize = 16;
            boxStyle.normal.textColor = Color.white;

            GUI.Box(
                new Rect((Screen.width * 0.5f) - 160f, Screen.height - 90f, 320f, 34f),
                "[E] " + currentPrompt,
                boxStyle
            );
        }
    }
}
