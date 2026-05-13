using UnityEngine;

public class PrototypeBootstrap : MonoBehaviour
{
    public bool buildOnAwake = true;
    public bool createPlayer = true;
    public bool createGameManager = true;

    void Awake()
    {
        if (!buildOnAwake)
        {
            return;
        }

        if (createGameManager && FindObjectOfType<GameManager>() == null)
        {
            GameObject managerObject = new GameObject("GameManager");
            managerObject.AddComponent<GameManager>();
        }

        BuildRoom();

        if (createPlayer && FindObjectOfType<PlayerController>() == null)
        {
            CreatePlayerRig();
        }
    }

    void BuildRoom()
    {
        Transform roomRoot = new GameObject("QuotaDropPrototypeRoom").transform;

        CreateBlock(roomRoot, "Floor", new Vector3(0f, -0.5f, 0f), new Vector3(18f, 1f, 18f), new Color(0.14f, 0.14f, 0.16f));
        CreateBlock(roomRoot, "Ceiling", new Vector3(0f, 6.5f, 0f), new Vector3(18f, 1f, 18f), new Color(0.11f, 0.11f, 0.12f));
        CreateBlock(roomRoot, "BackWall", new Vector3(0f, 3f, 9f), new Vector3(18f, 7f, 1f), new Color(0.19f, 0.18f, 0.2f));
        CreateBlock(roomRoot, "FrontWall", new Vector3(0f, 3f, -9f), new Vector3(18f, 7f, 1f), new Color(0.19f, 0.18f, 0.2f));
        CreateBlock(roomRoot, "LeftWall", new Vector3(-9f, 3f, 0f), new Vector3(1f, 7f, 18f), new Color(0.18f, 0.17f, 0.19f));
        CreateBlock(roomRoot, "RightWall", new Vector3(9f, 3f, 0f), new Vector3(1f, 7f, 18f), new Color(0.18f, 0.17f, 0.19f));

        CreateBlock(roomRoot, "CenterPlatform", new Vector3(0f, 0.2f, 0f), new Vector3(7f, 0.4f, 5f), new Color(0.22f, 0.21f, 0.25f));
        CreateBlock(roomRoot, "RearDais", new Vector3(0f, 0.35f, 6f), new Vector3(8f, 0.7f, 2.8f), new Color(0.2f, 0.19f, 0.22f));
        CreateBlock(roomRoot, "SideWalkwayLeft", new Vector3(-5.5f, 0.15f, -3f), new Vector3(3f, 0.3f, 8f), new Color(0.17f, 0.17f, 0.2f));
        CreateBlock(roomRoot, "SideWalkwayRight", new Vector3(5.5f, 0.15f, -3f), new Vector3(3f, 0.3f, 8f), new Color(0.17f, 0.17f, 0.2f));

        CreatePillar(roomRoot, new Vector3(-7.2f, 2.7f, -7.2f));
        CreatePillar(roomRoot, new Vector3(7.2f, 2.7f, -7.2f));
        CreatePillar(roomRoot, new Vector3(-7.2f, 2.7f, 7.2f));
        CreatePillar(roomRoot, new Vector3(7.2f, 2.7f, 7.2f));

        CreateStation(roomRoot, "DebtEngine", new Vector3(0f, 0.95f, 0.3f), new Vector3(1.8f, 1.9f, 1.4f), new Color(0.7f, 0.15f, 0.1f), typeof(SlotMachine));
        CreateStation(roomRoot, "DepositTerminal", new Vector3(-5.4f, 0.9f, 2.4f), new Vector3(1.2f, 1.8f, 1f), new Color(0.2f, 0.55f, 0.24f), typeof(DepositTerminal));
        CreateStation(roomRoot, "DispatchIntercom", new Vector3(5.7f, 1.5f, 5.8f), new Vector3(0.8f, 1.4f, 0.35f), new Color(0.4f, 0.4f, 0.48f), typeof(DispatchIntercom));
        CreateStation(roomRoot, "TokenPrinter", new Vector3(5.2f, 0.85f, -4.2f), new Vector3(1f, 1.7f, 0.8f), new Color(0.8f, 0.55f, 0.12f), typeof(TokenPrinter));
        CreateStation(roomRoot, "OverheadReclaimerConsole", new Vector3(0f, 5.6f, -5.5f), new Vector3(3.5f, 0.35f, 3.5f), new Color(0.45f, 0.08f, 0.08f), typeof(OverheadReclaimer));

        CreateLamp(roomRoot, new Vector3(0f, 5.8f, 0f), new Color(1f, 0.44f, 0.3f), 9f, 14f);
        CreateLamp(roomRoot, new Vector3(-5.5f, 5.6f, -4f), new Color(0.35f, 0.5f, 1f), 4f, 10f);
        CreateLamp(roomRoot, new Vector3(5.5f, 5.6f, 4f), new Color(0.55f, 1f, 0.5f), 4f, 10f);
    }

    void CreatePlayerRig()
    {
        GameObject player = GameObject.CreatePrimitive(PrimitiveType.Capsule);
        player.name = "Player";
        player.transform.position = new Vector3(0f, 1.1f, -6f);

        DestroyImmediate(player.GetComponent<Collider>());

        CharacterController controller = player.AddComponent<CharacterController>();
        controller.height = 1.8f;
        controller.radius = 0.35f;
        controller.center = new Vector3(0f, 0.9f, 0f);

        GameObject cameraObject = new GameObject("PlayerCamera");
        cameraObject.transform.SetParent(player.transform);
        cameraObject.transform.localPosition = new Vector3(0f, 1.55f, 0f);

        Camera cameraComponent = cameraObject.AddComponent<Camera>();
        cameraComponent.clearFlags = CameraClearFlags.SolidColor;
        cameraComponent.backgroundColor = new Color(0.03f, 0.03f, 0.04f);
        cameraObject.AddComponent<AudioListener>();

        PlayerController playerController = player.AddComponent<PlayerController>();
        playerController.playerCamera = cameraObject.transform;
        playerController.mouseSensitivity = 2.4f;
        playerController.moveSpeed = 5.8f;
        playerController.sprintSpeed = 8.4f;
        playerController.interactionDistance = 3.5f;
    }

    GameObject CreateBlock(Transform parent, string objectName, Vector3 position, Vector3 scale, Color color)
    {
        GameObject block = GameObject.CreatePrimitive(PrimitiveType.Cube);
        block.name = objectName;
        block.transform.SetParent(parent);
        block.transform.localPosition = position;
        block.transform.localScale = scale;
        ApplyColor(block, color);
        return block;
    }

    void CreatePillar(Transform parent, Vector3 position)
    {
        GameObject pillar = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
        pillar.name = "Pillar";
        pillar.transform.SetParent(parent);
        pillar.transform.localPosition = position;
        pillar.transform.localScale = new Vector3(0.7f, 2.7f, 0.7f);
        ApplyColor(pillar, new Color(0.22f, 0.22f, 0.25f));
    }

    void CreateStation(Transform parent, string objectName, Vector3 position, Vector3 scale, Color color, System.Type scriptType)
    {
        GameObject station = GameObject.CreatePrimitive(PrimitiveType.Cube);
        station.name = objectName;
        station.transform.SetParent(parent);
        station.transform.localPosition = position;
        station.transform.localScale = scale;
        ApplyColor(station, color);
        station.AddComponent(scriptType);

        GameObject top = GameObject.CreatePrimitive(PrimitiveType.Cube);
        top.name = objectName + "_Top";
        top.transform.SetParent(station.transform);
        top.transform.localPosition = new Vector3(0f, 0.55f, -0.18f);
        top.transform.localScale = new Vector3(0.8f, 0.18f, 0.28f);
        ApplyColor(top, Color.black);
    }

    void CreateLamp(Transform parent, Vector3 position, Color lightColor, float intensity, float range)
    {
        GameObject lightObject = new GameObject("Lamp");
        lightObject.transform.SetParent(parent);
        lightObject.transform.localPosition = position;

        Light lightComponent = lightObject.AddComponent<Light>();
        lightComponent.type = LightType.Point;
        lightComponent.color = lightColor;
        lightComponent.intensity = intensity;
        lightComponent.range = range;
    }

    void ApplyColor(GameObject target, Color color)
    {
        Renderer renderer = target.GetComponent<Renderer>();
        if (renderer == null)
        {
            return;
        }

        Material material = new Material(Shader.Find("Standard"));
        material.color = color;
        renderer.material = material;
    }
}
