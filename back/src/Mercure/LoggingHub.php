<?php

namespace App\Mercure;

use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Mercure\Jwt\TokenProviderInterface;
use Symfony\Component\Mercure\Jwt\TokenFactoryInterface;

final class LoggingHub implements HubInterface
{
  public function __construct(private HubInterface $inner)
  {
    error_log("✅ LoggingHub décorateur chargé !");
  }

  public function publish(Update $update): string
  {
    $topics = $update->getTopics();
    $topics = is_array($topics) ? $topics : [$topics];

    $id   = $update->getId() ?? '(no-id)';
    $type = $update->getType() ?? '(no-type)';
    $data = $update->getData();
    $short = is_string($data) ? (mb_strlen($data) > 800 ? mb_substr($data, 0, 800) . '…' : $data) : '(non-string)';

    error_log("🔔 MERCURE PUBLISH
  topics: " . implode(' | ', $topics) . "
  id:     " . $id . "
  type:   " . $type . "
  data:   " . $short . "
");

    return $this->inner->publish($update);
  }

  public function getUrl(): string
  {
    return $this->inner->getUrl();
  }

  public function getPublicUrl(): string
  {
    return $this->inner->getPublicUrl();
  }

  public function getProvider(): TokenProviderInterface
  {
    return $this->inner->getProvider();
  }

  public function getFactory(): TokenFactoryInterface
  {
    return $this->inner->getFactory();
  }
}
