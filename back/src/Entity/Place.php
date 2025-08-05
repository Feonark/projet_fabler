<?php

namespace App\Entity;

use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use Doctrine\ORM\Mapping as ORM;
use App\State\PlaceStateProcessor;
use App\Repository\PlaceRepository;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: PlaceRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['read']],
    denormalizationContext: ['groups' => ['write']],
    operations: [
        new Get(),
        new GetCollection(
            uriTemplate: '/stories/{id}/places',
            uriVariables: [
                'id' => new Link(
                    fromClass: Story::class,
                    fromProperty: 'places'
                )
            ]
        ),
        new Post(
            processor: PlaceStateProcessor::class,
            securityPostDenormalize: "is_granted('PLACE_CREATE', object)",
            validationContext: ['groups' => ['create']],
            denormalizationContext: ['groups' => ['create_write']]
        ),
        new Patch(
            security: "is_granted('PLACE_EDIT', object)",
            validationContext: ['groups' => ['edit']],
            denormalizationContext: ['groups' => ['edit_write']]
        ),
        new Delete(
            security: "is_granted('PLACE_DELETE', object)"
        )
    ]
)]
class Place
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups('read')]
    private ?int $id = null;

    #[ORM\Column(length: 6, nullable: true)]
    #[Groups('read')]
    private ?string $hashId = null;

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank(
        groups: ['create', 'edit']
    )]
    #[Assert\Length(
        min: 3,
        max: 50,
        minMessage: 'The title must be at least {{ limit }} characters long.',
        maxMessage: 'The title cannot be longer than {{ limit }} characters.',
        groups: ['create', 'edit']
    )]
    #[Assert\Regex(
        pattern: '/<[^>]*>/',
        match: false,
        message: 'HTML tags are not allowed in the title.',
        groups: ['create', 'edit']
    )]
    #[Groups(['read', 'create_write', 'edit_write'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT)]
    #[Assert\NotBlank(
        message: 'Description cannot be blank.',
        groups: ['create', 'edit']
    )]
    #[Assert\Length(
        max: 200,
        maxMessage: 'Description cannot be longer than {{ limit }} characters.',
        groups: ['create', 'edit']
    )]
    #[Assert\Regex(
        pattern: '/<[^>]*>/',
        match: false,
        message: 'HTML tags are not allowed in the title.',
        groups: ['create', 'edit']
    )]
    #[Groups(['read', 'create_write', 'edit_write'])]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['read', 'create_write', 'edit_write'])]
    private ?string $placeImageUrl = null;

    #[ORM\OneToOne(mappedBy: 'currentPlace', cascade: ['persist', 'remove'])]
    #[Groups('read')]
    private ?Chat $chat = null;

    #[ORM\ManyToOne(inversedBy: 'places')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['read', 'create_write'])]
    #[ApiProperty(readableLink: false, writableLink: false)]
    private ?Story $story = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getHashId(): ?string
    {
        return $this->hashId;
    }

    public function setHashId(string $hashId): static
    {
        $this->hashId = $hashId;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getChat(): ?Chat
    {
        return $this->chat;
    }

    public function setChat(Chat $chat): static
    {
        // set the owning side of the relation if necessary
        if ($chat->getCurrentPlace() !== $this) {
            $chat->setCurrentPlace($this);
        }

        $this->chat = $chat;

        return $this;
    }

    public function getStory(): ?Story
    {
        return $this->story;
    }

    public function setStory(?Story $story): static
    {
        $this->story = $story;

        return $this;
    }

    public function getPlaceImageUrl(): ?string
    {
        return $this->placeImageUrl;
    }

    public function setPlaceImageUrl(?string $placeImageUrl): static
    {
        $this->placeImageUrl = $placeImageUrl;

        return $this;
    }
}
